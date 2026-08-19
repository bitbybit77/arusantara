<?php

use App\Actions\Trust\CreateMakerReview;
use App\Models\Procurement\Deal;
use App\Models\Trust\MakerReview;
use App\Models\User;
use App\Procurement\DealStatus;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

function validMakerReviewRatings(): array
{
    return [
        'overall_rating' => 5,
        'quality_rating' => 5,
        'specification_compliance_rating' => 4,
        'communication_rating' => 4,
        'delivery_rating' => 5,
    ];
}

test('maker reviews are tied to one legitimate deal', function () {
    expect(Schema::hasColumns('maker_reviews', [
        'id', 'deal_id', 'customer_id', 'maker_profile_id', 'overall_rating', 'quality_rating',
        'specification_compliance_rating', 'communication_rating', 'delivery_rating', 'comment',
    ]))->toBeTrue()
        ->and(Schema::hasIndex('maker_reviews', ['deal_id'], 'unique'))->toBeTrue()
        ->and(Schema::hasIndex('maker_reviews', ['maker_profile_id', 'created_at']))->toBeTrue();

    $deal = Deal::factory()->completed()->create();

    $review = app(CreateMakerReview::class)->handle(
        $deal,
        $deal->customer,
        validMakerReviewRatings(),
        'The panel matches the agreed specification.',
    );

    expect($review->deal->is($deal))->toBeTrue()
        ->and($review->customer->is($deal->customer))->toBeTrue()
        ->and($review->makerProfile->is($deal->maker))->toBeTrue();

    $this->assertModelExists($review);
});

test('a customer cannot review a maker without an appropriate completed deal', function () {
    $deal = Deal::factory()->create();

    expect(fn () => app(CreateMakerReview::class)->handle(
        $deal,
        $deal->customer,
        validMakerReviewRatings(),
    ))->toThrow(DomainException::class);

    $completedDeal = Deal::factory()->completed()->create();
    $unrelatedCustomer = User::factory()->customer()->create();

    expect(fn () => app(CreateMakerReview::class)->handle(
        $completedDeal,
        $unrelatedCustomer,
        validMakerReviewRatings(),
    ))->toThrow(AuthorizationException::class);
});

test('a completed deal has at most one review with ratings from one to five', function () {
    $deal = Deal::factory()->completed()->create();
    $action = app(CreateMakerReview::class);

    $action->handle($deal, $deal->customer, validMakerReviewRatings());

    expect(fn () => $action->handle($deal, $deal->customer, validMakerReviewRatings()))
        ->toThrow(DomainException::class)
        ->and(fn () => app(CreateMakerReview::class)->handle(
            Deal::factory()->completed()->create(),
            $deal->customer,
            [...validMakerReviewRatings(), 'overall_rating' => 6],
        ))->toThrow(ValidationException::class)
        ->and(MakerReview::query()->whereBelongsTo($deal)->count())->toBe(1);
});

test('maker review factory preserves completed deal participants', function () {
    $review = MakerReview::factory()->create();

    expect($review->deal->status->value)->toBe('completed')
        ->and($review->customer->is($review->deal->customer))->toBeTrue()
        ->and($review->makerProfile->is($review->deal->maker))->toBeTrue();
});

test('an administratively closed completed deal remains reviewable', function () {
    $deal = Deal::factory()->completed()->create();
    $deal->update([
        'status' => DealStatus::Closed,
        'closed_at' => now(),
    ]);

    $review = app(CreateMakerReview::class)->handle(
        $deal,
        $deal->customer,
        validMakerReviewRatings(),
    );

    expect($review->deal->is($deal))->toBeTrue();
});
