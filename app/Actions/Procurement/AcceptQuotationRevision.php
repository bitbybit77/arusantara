<?php

namespace App\Actions\Procurement;

use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationLine;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Procurement\Deal;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationItem;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Models\Procurement\TechnicalDeviation;
use App\Models\User;
use App\Procurement\DealStatus;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use App\Procurement\TechnicalDeviationStatus;
use DomainException;
use Illuminate\Support\Facades\DB;

class AcceptQuotationRevision
{
    public function handle(QuotationRevision $quotationRevision, User $customer, string $dealNumber): Deal
    {
        return DB::transaction(function () use ($quotationRevision, $customer, $dealNumber): Deal {
            $lockedRevision = QuotationRevision::query()
                ->whereKey($quotationRevision->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $quotation = Quotation::query()
                ->whereKey($lockedRevision->quotation_id)
                ->lockForUpdate()
                ->firstOrFail();

            $rfq = Rfq::query()
                ->whereKey($quotation->rfq_id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureRevisionCanBeAccepted($lockedRevision, $quotation, $rfq, $customer);

            $calculationSnapshot = CalculationSnapshot::query()
                ->whereKey($rfq->calculation_snapshot_id)
                ->lockForUpdate()
                ->firstOrFail();

            $projectConfiguration = ProjectConfiguration::query()
                ->whereKey($calculationSnapshot->project_configuration_id)
                ->firstOrFail();

            $project = Project::query()
                ->whereKey($projectConfiguration->project_id)
                ->firstOrFail();

            if ((int) $project->getKey() !== (int) $rfq->project_id
                || (int) $project->customer_id !== (int) $rfq->customer_id) {
                throw new DomainException('The RFQ calculation baseline is inconsistent with its project.');
            }

            $calculationSnapshot->load([
                'lines' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            ]);

            $lockedRevision->load([
                'items' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'technicalDeviations' => fn ($query) => $query->orderBy('id'),
            ]);

            $acceptedAt = now();

            $technicalSnapshot = $this->technicalSnapshot($rfq, $calculationSnapshot, $lockedRevision);
            $commercialSnapshot = $this->commercialSnapshot($lockedRevision);

            $quotation->update([
                'current_revision_id' => $lockedRevision->getKey(),
                'status' => QuotationStatus::Accepted,
            ]);

            $rfq->update([
                'status' => RfqStatus::Awarded,
                'closed_at' => $acceptedAt,
            ]);

            $deal = Deal::query()->create([
                'rfq_id' => $rfq->getKey(),
                'quotation_id' => $quotation->getKey(),
                'quotation_revision_id' => $lockedRevision->getKey(),
                'customer_id' => $rfq->customer_id,
                'maker_profile_id' => $quotation->maker_profile_id,
                'number' => $dealNumber,
                'status' => DealStatus::Accepted,
                'currency_code' => $lockedRevision->currency_code,
                'agreed_value' => $lockedRevision->grand_total,
                'lead_time_days' => $lockedRevision->lead_time_days,
                'warranty_months' => $lockedRevision->warranty_months,
                'technical_snapshot' => $technicalSnapshot,
                'commercial_snapshot' => $commercialSnapshot,
                'accepted_at' => $acceptedAt,
            ]);

            return $deal;
        }, 3);
    }

    private function ensureRevisionCanBeAccepted(
        QuotationRevision $quotationRevision,
        Quotation $quotation,
        Rfq $rfq,
        User $customer,
    ): void {
        if ((int) $rfq->customer_id !== (int) $customer->getKey()) {
            throw new DomainException('Only the RFQ customer may accept a quotation revision.');
        }

        if ($quotationRevision->submitted_at === null) {
            throw new DomainException('Only a submitted quotation revision may be accepted.');
        }

        if ($quotation->current_revision_id !== null
            && (int) $quotation->current_revision_id !== (int) $quotationRevision->getKey()) {
            throw new DomainException('Only the current quotation revision may be accepted.');
        }

        $hasNewerSubmittedRevision = $quotation->revisions()
            ->where('revision_number', '>', $quotationRevision->revision_number)
            ->whereNotNull('submitted_at')
            ->exists();

        if ($hasNewerSubmittedRevision) {
            throw new DomainException('A newer submitted quotation revision is available.');
        }

        if (! in_array($quotation->status, [QuotationStatus::Submitted, QuotationStatus::Negotiating], true)) {
            throw new DomainException('The quotation is not available for acceptance.');
        }

        if (! in_array($rfq->status, [RfqStatus::Open, RfqStatus::Negotiating], true)) {
            throw new DomainException('The RFQ is not available for an award.');
        }

        if (Deal::query()->where('rfq_id', $rfq->getKey())->exists()) {
            throw new DomainException('The RFQ has already been awarded.');
        }

        $hasUnacceptedDeviation = $quotationRevision->technicalDeviations()
            ->where('status', '!=', TechnicalDeviationStatus::Accepted)
            ->exists();

        if ($hasUnacceptedDeviation) {
            throw new DomainException('All technical deviations must be accepted before the quotation can be awarded.');
        }
    }

    /** @return array<string, mixed> */
    private function technicalSnapshot(
        Rfq $rfq,
        CalculationSnapshot $calculationSnapshot,
        QuotationRevision $quotationRevision,
    ): array {
        return [
            'rfq' => [
                'id' => $rfq->getKey(),
                'number' => $rfq->number,
                'title' => $rfq->title,
                'requirements' => $rfq->requirements,
                'installation_location' => $rfq->installation_location,
                'published_at' => $rfq->getRawOriginal('published_at'),
                'due_at' => $rfq->getRawOriginal('due_at'),
            ],
            'calculation_snapshot_id' => $calculationSnapshot->getKey(),
            'project_configuration_id' => $calculationSnapshot->project_configuration_id,
            'version' => $calculationSnapshot->version,
            'calculator_version' => $calculationSnapshot->calculator_version,
            'input_hash' => $calculationSnapshot->input_hash,
            'connected_load_w' => $calculationSnapshot->connected_load_w,
            'design_load_w' => $calculationSnapshot->design_load_w,
            'design_current_a' => $calculationSnapshot->design_current_a,
            'recommended_supply_v' => $calculationSnapshot->recommended_supply_v,
            'recommended_phase' => $calculationSnapshot->getRawOriginal('recommended_phase'),
            'result_status' => $calculationSnapshot->getRawOriginal('result_status'),
            'input_payload' => $calculationSnapshot->input_payload,
            'result_payload' => $calculationSnapshot->result_payload,
            'assumptions' => $calculationSnapshot->assumptions,
            'warnings' => $calculationSnapshot->warnings,
            'calculated_at' => $calculationSnapshot->getRawOriginal('calculated_at'),
            'lines' => $calculationSnapshot->lines
                ->map(fn (CalculationLine $line): array => [
                    'source_configuration_line_id' => $line->source_configuration_line_id,
                    'line_code' => $line->line_code,
                    'line_type' => $line->getRawOriginal('line_type'),
                    'description' => $line->description,
                    'quantity' => $line->quantity,
                    'rated_power_w' => $line->rated_power_w,
                    'design_power_w' => $line->design_power_w,
                    'design_current_a' => $line->design_current_a,
                    'phase' => $line->getRawOriginal('phase'),
                    'circuit_group' => $line->circuit_group,
                    'recommended_protection' => $line->recommended_protection,
                    'recommended_rating_a' => $line->recommended_rating_a,
                    'result_status' => $line->getRawOriginal('result_status'),
                    'education_reference' => $line->education_reference,
                    'calculation_detail' => $line->calculation_detail,
                    'sort_order' => $line->sort_order,
                ])
                ->all(),
            'accepted_technical_deviations' => $quotationRevision->technicalDeviations
                ->map(fn (TechnicalDeviation $deviation): array => [
                    'baseline_reference' => $deviation->baseline_reference,
                    'requested_specification' => $deviation->requested_specification,
                    'proposed_specification' => $deviation->proposed_specification,
                    'reason' => $deviation->reason,
                    'status' => $deviation->getRawOriginal('status'),
                    'responded_at' => $deviation->getRawOriginal('responded_at'),
                ])
                ->all(),
        ];
    }

    /** @return array<string, mixed> */
    private function commercialSnapshot(QuotationRevision $quotationRevision): array
    {
        return [
            'quotation_revision_id' => $quotationRevision->getKey(),
            'revision_number' => $quotationRevision->revision_number,
            'currency_code' => $quotationRevision->currency_code,
            'component_cost' => $quotationRevision->component_cost,
            'fabrication_cost' => $quotationRevision->fabrication_cost,
            'installation_cost' => $quotationRevision->installation_cost,
            'other_cost' => $quotationRevision->other_cost,
            'subtotal' => $quotationRevision->subtotal,
            'discount_amount' => $quotationRevision->discount_amount,
            'tax_amount' => $quotationRevision->tax_amount,
            'grand_total' => $quotationRevision->grand_total,
            'lead_time_days' => $quotationRevision->lead_time_days,
            'warranty_months' => $quotationRevision->warranty_months,
            'notes' => $quotationRevision->notes,
            'submitted_at' => $quotationRevision->getRawOriginal('submitted_at'),
            'items' => $quotationRevision->items
                ->map(fn (QuotationItem $item): array => [
                    'type' => $item->getRawOriginal('type'),
                    'description' => $item->description,
                    'manufacturer' => $item->manufacturer,
                    'part_number' => $item->part_number,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit,
                    'unit_price' => $item->unit_price,
                    'line_total' => $item->line_total,
                    'specification' => $item->specification,
                    'sort_order' => $item->sort_order,
                ])
                ->all(),
            'technical_deviation_impacts' => $quotationRevision->technicalDeviations
                ->map(fn (TechnicalDeviation $deviation): array => [
                    'baseline_reference' => $deviation->baseline_reference,
                    'price_impact' => $deviation->price_impact,
                    'lead_time_impact_days' => $deviation->lead_time_impact_days,
                ])
                ->all(),
        ];
    }
}
