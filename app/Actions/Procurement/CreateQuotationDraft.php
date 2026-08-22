<?php

namespace App\Actions\Procurement;

use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Procurement\RfqStatus;
use DomainException;
use Illuminate\Support\Facades\DB;

class CreateQuotationDraft
{
    public function handle(Rfq $rfq, MakerProfile $maker, string $number): Quotation
    {
        return DB::transaction(function () use ($rfq, $maker, $number): Quotation {
            $lockedRfq = Rfq::query()
                ->whereKey($rfq->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if (! in_array($lockedRfq->status, [RfqStatus::Open, RfqStatus::Negotiating], true)) {
                throw new DomainException('The RFQ is not accepting quotations.');
            }

            $existing = Quotation::query()
                ->where('rfq_id', $lockedRfq->getKey())
                ->where('maker_profile_id', $maker->getKey())
                ->first();

            if ($existing !== null) {
                return $existing;
            }

            $quotation = Quotation::query()->create([
                'rfq_id' => $lockedRfq->getKey(),
                'maker_profile_id' => $maker->getKey(),
                'number' => $number,
            ]);

            QuotationRevision::query()->create([
                'quotation_id' => $quotation->getKey(),
                'revision_number' => 1,
                'currency_code' => 'IDR',
            ]);

            return $quotation->fresh(['rfq', 'revisions']) ?? $quotation;
        }, 3);
    }
}
