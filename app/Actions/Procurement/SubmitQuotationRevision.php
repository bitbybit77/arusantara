<?php

namespace App\Actions\Procurement;

use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use App\Procurement\TechnicalDeviationStatus;
use DomainException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class SubmitQuotationRevision
{
    public function handle(QuotationRevision $quotationRevision, MakerProfile $maker): QuotationRevision
    {
        return DB::transaction(function () use ($quotationRevision, $maker): QuotationRevision {
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

            if ((int) $quotation->maker_profile_id !== (int) $maker->getKey()) {
                throw new DomainException('Only the quotation maker may submit this revision.');
            }

            if ($lockedRevision->submitted_at !== null) {
                throw new DomainException('This quotation revision has already been submitted.');
            }

            if (! in_array($quotation->status, [
                QuotationStatus::Draft,
                QuotationStatus::Submitted,
                QuotationStatus::Negotiating,
            ], true)) {
                throw new DomainException('This quotation can no longer submit revisions.');
            }

            if (! in_array($rfq->status, [RfqStatus::Open, RfqStatus::Negotiating], true)) {
                throw new DomainException('The RFQ is not accepting quotation revisions.');
            }

            $hasNewerSubmittedRevision = $quotation->revisions()
                ->where('revision_number', '>', $lockedRevision->revision_number)
                ->whereNotNull('submitted_at')
                ->exists();

            if ($hasNewerSubmittedRevision) {
                throw new DomainException('A newer quotation revision has already been submitted.');
            }

            $hasResolvedDraftDeviation = $lockedRevision->technicalDeviations()
                ->where(function (Builder $query): void {
                    $query->where('status', '!=', TechnicalDeviationStatus::Pending->value)
                        ->orWhereNotNull('responded_at');
                })
                ->exists();

            if ($hasResolvedDraftDeviation) {
                throw new DomainException('Technical deviations must be pending when their revision is submitted.');
            }

            $nextStatus = $quotation->status === QuotationStatus::Draft
                ? QuotationStatus::Submitted
                : QuotationStatus::Negotiating;

            $lockedRevision->update(['submitted_at' => now()]);
            $quotation->update([
                'current_revision_id' => $lockedRevision->getKey(),
                'status' => $nextStatus,
            ]);

            return $lockedRevision->fresh();
        }, 3);
    }
}
