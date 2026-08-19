<?php

namespace App\Actions\Procurement;

use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Models\Procurement\TechnicalDeviation;
use App\Models\User;
use App\Procurement\TechnicalDeviationStatus;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class RespondToTechnicalDeviation
{
    public function handle(
        TechnicalDeviation $technicalDeviation,
        User $customer,
        TechnicalDeviationStatus $response,
    ): TechnicalDeviation {
        if ($response === TechnicalDeviationStatus::Pending) {
            throw new DomainException('A technical deviation response must be accepted or rejected.');
        }

        return DB::transaction(function () use ($technicalDeviation, $customer, $response): TechnicalDeviation {
            $lockedDeviation = TechnicalDeviation::query()
                ->whereKey($technicalDeviation->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $revision = QuotationRevision::query()
                ->whereKey($lockedDeviation->quotation_revision_id)
                ->lockForUpdate()
                ->firstOrFail();

            $quotation = Quotation::query()
                ->whereKey($revision->quotation_id)
                ->lockForUpdate()
                ->firstOrFail();

            $rfq = Rfq::query()
                ->whereKey($quotation->rfq_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ((int) $rfq->customer_id !== (int) $customer->getKey()) {
                throw new AuthorizationException('Only the RFQ customer may respond to a technical deviation.');
            }

            if ($revision->submitted_at === null
                || (int) $quotation->current_revision_id !== (int) $revision->getKey()) {
                throw new DomainException('Only a deviation on the current submitted revision may be answered.');
            }

            if ($lockedDeviation->status !== TechnicalDeviationStatus::Pending) {
                throw new DomainException('This technical deviation already has a final response.');
            }

            $lockedDeviation->update([
                'status' => $response,
                'responded_at' => now(),
            ]);

            return $lockedDeviation->fresh();
        }, 3);
    }
}
