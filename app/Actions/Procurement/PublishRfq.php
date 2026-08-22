<?php

namespace App\Actions\Procurement;

use App\Models\Procurement\Rfq;
use App\Models\User;
use App\Procurement\RfqStatus;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class PublishRfq
{
    public function handle(Rfq $rfq, User $customer): Rfq
    {
        return DB::transaction(function () use ($rfq, $customer): Rfq {
            $lockedRfq = Rfq::query()
                ->whereKey($rfq->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ((int) $lockedRfq->customer_id !== (int) $customer->getKey()) {
                throw new AuthorizationException('Only the RFQ customer may publish this RFQ.');
            }

            if ($lockedRfq->status !== RfqStatus::Draft) {
                throw new DomainException('Only a draft RFQ may be published.');
            }

            $lockedRfq->update([
                'status' => RfqStatus::Open,
            ]);

            $lockedRfq->refresh();

            return $lockedRfq;
        }, 3);
    }
}
