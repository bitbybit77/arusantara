<?php

namespace App\Actions\Procurement;

use App\Models\Procurement\Deal;
use App\Procurement\DealStatus;
use DomainException;
use Illuminate\Support\Facades\DB;

class CompleteDeal
{
    public function handle(Deal $deal): Deal
    {
        return DB::transaction(function () use ($deal): Deal {
            $lockedDeal = Deal::query()
                ->whereKey($deal->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if (! in_array($lockedDeal->status, [DealStatus::Accepted, DealStatus::InProgress], true)) {
                throw new DomainException('Only an accepted or in-progress deal may be completed.');
            }

            $lockedDeal->update([
                'status' => DealStatus::Completed,
                'completed_at' => now(),
            ]);

            return $lockedDeal;
        }, 3);
    }
}
