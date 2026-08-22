<?php

namespace App\Actions\Procurement;

use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Models\User;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use DomainException;
use Illuminate\Support\Facades\DB;

class StartQuotationNegotiation
{
    public function handle(Quotation $quotation, User $customer): Quotation
    {
        return DB::transaction(function () use ($quotation, $customer): Quotation {
            $lockedQuotation = Quotation::query()
                ->whereKey($quotation->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $rfq = Rfq::query()
                ->whereKey($lockedQuotation->rfq_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ((int) $rfq->customer_id !== (int) $customer->getKey()) {
                throw new DomainException('Only the RFQ customer may start quotation negotiation.');
            }

            if (! in_array($lockedQuotation->status, [
                QuotationStatus::Submitted,
                QuotationStatus::Negotiating,
            ], true)) {
                throw new DomainException('This quotation is not available for negotiation.');
            }

            if (! in_array($rfq->status, [RfqStatus::Open, RfqStatus::Negotiating], true)) {
                throw new DomainException('This RFQ is not available for negotiation.');
            }

            if ($lockedQuotation->current_revision_id === null) {
                throw new DomainException('A submitted quotation revision is required before negotiation.');
            }

            $currentRevisionIsSubmitted = QuotationRevision::query()
                ->whereKey($lockedQuotation->current_revision_id)
                ->where('quotation_id', $lockedQuotation->getKey())
                ->whereNotNull('submitted_at')
                ->exists();

            if (! $currentRevisionIsSubmitted) {
                throw new DomainException('The current quotation revision must be submitted before negotiation.');
            }

            if ($lockedQuotation->status === QuotationStatus::Submitted) {
                $lockedQuotation->update(['status' => QuotationStatus::Negotiating]);
            }

            if ($rfq->status === RfqStatus::Open) {
                $rfq->update(['status' => RfqStatus::Negotiating]);
            }

            return $lockedQuotation->fresh() ?? $lockedQuotation;
        }, 3);
    }
}
