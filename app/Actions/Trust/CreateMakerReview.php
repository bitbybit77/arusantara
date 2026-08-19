<?php

namespace App\Actions\Trust;

use App\Models\Procurement\Deal;
use App\Models\Trust\MakerReview;
use App\Models\User;
use App\Procurement\DealStatus;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CreateMakerReview
{
    /**
     * @param  array{
     *     overall_rating: int,
     *     quality_rating: int,
     *     specification_compliance_rating: int,
     *     communication_rating: int,
     *     delivery_rating: int
     * }  $ratings
     */
    public function handle(Deal $deal, User $customer, array $ratings, ?string $comment = null): MakerReview
    {
        $validatedRatings = Validator::make($ratings, [
            'overall_rating' => ['required', 'integer', 'between:1,5'],
            'quality_rating' => ['required', 'integer', 'between:1,5'],
            'specification_compliance_rating' => ['required', 'integer', 'between:1,5'],
            'communication_rating' => ['required', 'integer', 'between:1,5'],
            'delivery_rating' => ['required', 'integer', 'between:1,5'],
        ])->validate();

        return DB::transaction(function () use ($deal, $customer, $validatedRatings, $comment): MakerReview {
            $lockedDeal = Deal::query()->lockForUpdate()->findOrFail($deal->id);

            if (! in_array($lockedDeal->status, [DealStatus::Completed, DealStatus::Closed], true)
                || $lockedDeal->completed_at === null) {
                throw new DomainException('Only completed deals may be reviewed.');
            }

            if ($lockedDeal->customer_id !== $customer->id) {
                throw new AuthorizationException('Only the deal customer may review the maker.');
            }

            if (MakerReview::query()->whereBelongsTo($lockedDeal)->exists()) {
                throw new DomainException('This deal has already been reviewed.');
            }

            return MakerReview::query()->create([
                'deal_id' => $lockedDeal->id,
                'customer_id' => $customer->id,
                'maker_profile_id' => $lockedDeal->maker_profile_id,
                ...$validatedRatings,
                'comment' => $comment,
            ]);
        });
    }
}
