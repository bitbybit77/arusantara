<?php

namespace App\Actions\Procurement;

use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationItem;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Models\Procurement\TechnicalDeviation;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use DomainException;
use Illuminate\Support\Facades\DB;

class CreateQuotationRevisionDraft
{
    public function handle(Quotation $quotation, MakerProfile $maker): QuotationRevision
    {
        return DB::transaction(function () use ($quotation, $maker): QuotationRevision {
            $lockedQuotation = Quotation::query()
                ->whereKey($quotation->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ((int) $lockedQuotation->maker_profile_id !== (int) $maker->getKey()) {
                throw new DomainException('Only the quotation maker may create a revised quotation.');
            }

            if ($lockedQuotation->status !== QuotationStatus::Negotiating) {
                throw new DomainException('A revised quotation may only be created during negotiation.');
            }

            $rfq = Rfq::query()
                ->whereKey($lockedQuotation->rfq_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($rfq->status !== RfqStatus::Negotiating) {
                throw new DomainException('The RFQ must be negotiating before a revised quotation can be created.');
            }

            $existingDraft = QuotationRevision::query()
                ->where('quotation_id', $lockedQuotation->getKey())
                ->whereNull('submitted_at')
                ->orderByDesc('revision_number')
                ->lockForUpdate()
                ->first();

            if ($existingDraft !== null) {
                return $existingDraft;
            }

            if ($lockedQuotation->current_revision_id === null) {
                throw new DomainException('A current submitted quotation revision is required.');
            }

            $currentRevision = QuotationRevision::query()
                ->whereKey($lockedQuotation->current_revision_id)
                ->where('quotation_id', $lockedQuotation->getKey())
                ->whereNotNull('submitted_at')
                ->lockForUpdate()
                ->firstOrFail();

            $currentRevision->load([
                'items' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'technicalDeviations' => fn ($query) => $query->orderBy('id'),
            ]);

            $nextRevisionNumber = ((int) $lockedQuotation->revisions()->max('revision_number')) + 1;

            $draft = QuotationRevision::query()->create([
                'quotation_id' => $lockedQuotation->getKey(),
                'revision_number' => $nextRevisionNumber,
                'currency_code' => $currentRevision->currency_code,
                'component_cost' => $currentRevision->component_cost,
                'fabrication_cost' => $currentRevision->fabrication_cost,
                'installation_cost' => $currentRevision->installation_cost,
                'other_cost' => $currentRevision->other_cost,
                'subtotal' => $currentRevision->subtotal,
                'discount_amount' => $currentRevision->discount_amount,
                'tax_amount' => $currentRevision->tax_amount,
                'grand_total' => $currentRevision->grand_total,
                'lead_time_days' => $currentRevision->lead_time_days,
                'warranty_months' => $currentRevision->warranty_months,
                'notes' => $currentRevision->notes,
            ]);

            $currentRevision->items->each(function (QuotationItem $item) use ($draft): void {
                $draft->items()->create([
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
                ]);
            });

            $currentRevision->technicalDeviations->each(function (TechnicalDeviation $deviation) use ($draft): void {
                $draft->technicalDeviations()->create([
                    'baseline_reference' => $deviation->baseline_reference,
                    'requested_specification' => $deviation->requested_specification,
                    'proposed_specification' => $deviation->proposed_specification,
                    'reason' => $deviation->reason,
                    'price_impact' => $deviation->price_impact,
                    'lead_time_impact_days' => $deviation->lead_time_impact_days,
                ]);
            });

            return $draft->fresh(['items', 'technicalDeviations']) ?? $draft;
        }, 3);
    }
}
