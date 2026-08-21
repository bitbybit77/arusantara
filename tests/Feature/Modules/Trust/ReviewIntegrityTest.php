<?php

use App\Actions\Trust\CreateMakerReview;
use App\Models\Procurement\Deal;
use App\Models\Trust\MakerReview;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

function integrityReviewRatings(): array
{
    return [
        'overall_rating' => 5,
        'quality_rating' => 4,
        'specification_compliance_rating' => 5,
        'communication_rating' => 4,
        'delivery_rating' => 5,
    ];
}

test('review model independently enforces completed deal participants', function () {
    $deal = Deal::factory()->completed()->create();

    expect(fn () => MakerReview::query()->create([
        'deal_id' => $deal->id,
        'customer_id' => User::factory()->customer()->create()->id,
        'maker_profile_id' => $deal->maker_profile_id,
        ...integrityReviewRatings(),
    ]))->toThrow(LogicException::class, 'must match a completed deal');
});

test('review identity is immutable while ratings remain bounded and history cannot be deleted', function () {
    $deal = Deal::factory()->completed()->create();
    $review = app(CreateMakerReview::class)->handle(
        $deal,
        $deal->customer,
        integrityReviewRatings(),
    );

    expect($deal->review->is($review))->toBeTrue()
        ->and(fn () => $review->update([
            'customer_id' => User::factory()->customer()->create()->id,
        ]))->toThrow(LogicException::class, 'participants are immutable')
        ->and(fn () => $review->fresh()->update(['overall_rating' => 6]))
        ->toThrow(LogicException::class, 'one to five')
        ->and(fn () => $review->delete())
        ->toThrow(LogicException::class, 'cannot be deleted');
});

test('database constraints keep review participants aligned with their deal', function () {
    $review = MakerReview::factory()->create();

    expect(fn () => DB::table('maker_reviews')
        ->where('id', $review->id)
        ->update(['customer_id' => User::factory()->customer()->create()->id]))
        ->toThrow(QueryException::class);
});
