<?php

namespace App\Actions\Procurement;

use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Procurement\QuotationItemType;
use App\Procurement\QuotationStatus;
use DomainException;
use Illuminate\Support\Facades\DB;

class UpdateQuotationDraft
{
    /**
     * @param  list<array{description:string, manufacturer?:string|null, part_number?:string|null, quantity:float|int|string, unit:string, unit_price:float|int|string}>  $items
     * @param  list<array{baseline_reference:string, requested_specification:string, proposed_specification:string, reason:string, price_impact?:float|int|string, lead_time_impact_days?:int|string}>  $deviations
     */
    public function handle(
        Quotation $quotation,
        MakerProfile $maker,
        array $items,
        float $fabricationCost,
        float $installationCost,
        float $otherCost,
        float $discountAmount,
        float $taxAmount,
        ?int $leadTimeDays,
        ?int $warrantyMonths,
        ?string $notes,
        array $deviations = [],
    ): QuotationRevision {
        return DB::transaction(function () use (
            $quotation,
            $maker,
            $items,
            $fabricationCost,
            $installationCost,
            $otherCost,
            $discountAmount,
            $taxAmount,
            $leadTimeDays,
            $warrantyMonths,
            $notes,
            $deviations,
        ): QuotationRevision {
            $lockedQuotation = Quotation::query()
                ->whereKey($quotation->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ((int) $lockedQuotation->maker_profile_id !== (int) $maker->getKey()) {
                throw new DomainException('Only the quotation maker may edit this quotation.');
            }

            if ($lockedQuotation->status !== QuotationStatus::Draft) {
                throw new DomainException('Only a draft quotation may be edited.');
            }

            $revision = QuotationRevision::query()
                ->where('quotation_id', $lockedQuotation->getKey())
                ->whereNull('submitted_at')
                ->orderByDesc('revision_number')
                ->lockForUpdate()
                ->firstOrFail();

            $revision->items()->delete();
            $componentCost = 0.0;

            foreach ($items as $index => $item) {
                $quantity = (float) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $lineTotal = round($quantity * $unitPrice, 2);
                $componentCost += $lineTotal;

                $revision->items()->create([
                    'type' => QuotationItemType::Component,
                    'description' => trim($item['description']),
                    'manufacturer' => $this->nullableTrim($item['manufacturer'] ?? null),
                    'part_number' => $this->nullableTrim($item['part_number'] ?? null),
                    'quantity' => $quantity,
                    'unit' => trim($item['unit']),
                    'unit_price' => $this->money($unitPrice),
                    'line_total' => $this->money($lineTotal),
                    'sort_order' => $index,
                ]);
            }

            $subtotal = round($componentCost + $fabricationCost + $installationCost + $otherCost, 2);
            $grandTotal = round(max(0, $subtotal - $discountAmount + $taxAmount), 2);

            $revision->update([
                'component_cost' => $this->money($componentCost),
                'fabrication_cost' => $this->money($fabricationCost),
                'installation_cost' => $this->money($installationCost),
                'other_cost' => $this->money($otherCost),
                'subtotal' => $this->money($subtotal),
                'discount_amount' => $this->money($discountAmount),
                'tax_amount' => $this->money($taxAmount),
                'grand_total' => $this->money($grandTotal),
                'lead_time_days' => $leadTimeDays,
                'warranty_months' => $warrantyMonths,
                'notes' => $this->nullableTrim($notes),
            ]);

            $revision->technicalDeviations()->delete();

            foreach ($deviations as $deviation) {
                $revision->technicalDeviations()->create([
                    'baseline_reference' => trim($deviation['baseline_reference']),
                    'requested_specification' => trim($deviation['requested_specification']),
                    'proposed_specification' => trim($deviation['proposed_specification']),
                    'reason' => trim($deviation['reason']),
                    'price_impact' => $this->money((float) ($deviation['price_impact'] ?? 0)),
                    'lead_time_impact_days' => (int) ($deviation['lead_time_impact_days'] ?? 0),
                ]);
            }

            return $revision->fresh(['items', 'technicalDeviations']) ?? $revision;
        }, 3);
    }

    private function money(float $value): string
    {
        return number_format(round($value, 2), 2, '.', '');
    }

    private function nullableTrim(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
