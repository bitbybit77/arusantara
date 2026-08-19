<?php

use App\Actions\Procurement\CompleteDeal;
use App\Actions\Trust\CreateMakerReview;
use App\Models\Configuration\Project;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Procurement\Deal;
use App\Models\Procurement\Rfq;
use App\Models\User;
use App\Procurement\DealStatus;
use App\Procurement\RfqStatus;

test('an RFQ rejects a calculation baseline from another project or customer', function () {
    $snapshot = CalculationSnapshot::factory()->create();
    $unrelatedProject = Project::factory()->create();

    expect(fn () => Rfq::factory()->create([
        'project_id' => $unrelatedProject->id,
        'calculation_snapshot_id' => $snapshot->id,
        'customer_id' => $unrelatedProject->customer_id,
    ]))->toThrow(LogicException::class, 'must belong to its project and customer');

    $snapshotProject = $snapshot->projectConfiguration->project;

    expect(fn () => Rfq::factory()->create([
        'project_id' => $snapshotProject->id,
        'calculation_snapshot_id' => $snapshot->id,
        'customer_id' => User::factory()->customer()->create()->id,
    ]))->toThrow(LogicException::class, 'must belong to its project and customer');
});

test('an RFQ calculation baseline can never be replaced', function () {
    $rfq = Rfq::factory()->create();
    $replacementSnapshot = CalculationSnapshot::factory()->create();

    expect(fn () => $rfq->update([
        'calculation_snapshot_id' => $replacementSnapshot->id,
    ]))->toThrow(LogicException::class, 'baseline is immutable')
        ->and(fn () => $rfq->update([
            'customer_id' => User::factory()->customer()->create()->id,
        ]))->toThrow(LogicException::class, 'baseline is immutable');
});

test('an RFQ technical brief becomes immutable when it leaves draft', function () {
    $rfq = Rfq::factory()->create();

    $rfq->update([
        'title' => 'Final preliminary panel brief',
        'requirements' => ['installation' => true],
        'installation_location' => 'Bandung',
        'status' => RfqStatus::Open,
    ]);

    expect(fn () => $rfq->update([
        'requirements' => ['installation' => false],
    ]))->toThrow(LogicException::class, 'technical brief')
        ->and(fn () => $rfq->update([
            'installation_location' => 'Jakarta',
        ]))->toThrow(LogicException::class, 'technical brief');
});

test('accepted deal terms and snapshots cannot be changed or deleted', function () {
    $deal = Deal::factory()->create();

    expect(fn () => $deal->update([
        'agreed_value' => '1.00',
    ]))->toThrow(LogicException::class, 'terms and snapshots')
        ->and(fn () => $deal->update([
            'technical_snapshot' => ['changed' => true],
        ]))->toThrow(LogicException::class, 'terms and snapshots')
        ->and(fn () => $deal->delete())->toThrow(LogicException::class, 'cannot be deleted');

    expect($deal->fresh()->agreed_value)->not->toBe('1.00')
        ->and($deal->fresh()->technical_snapshot)->not->toBe(['changed' => true]);
});

test('deal completion uses a valid transition and unlocks legitimate review', function () {
    $deal = Deal::factory()->create();

    $completedDeal = app(CompleteDeal::class)->handle($deal);

    expect($completedDeal->status)->toBe(DealStatus::Completed)
        ->and($completedDeal->completed_at)->not->toBeNull();

    $review = app(CreateMakerReview::class)->handle(
        $completedDeal,
        $completedDeal->customer,
        [
            'overall_rating' => 5,
            'quality_rating' => 5,
            'specification_compliance_rating' => 5,
            'communication_rating' => 5,
            'delivery_rating' => 5,
        ],
    );

    expect($review->deal->is($completedDeal))->toBeTrue()
        ->and(fn () => app(CompleteDeal::class)->handle($completedDeal))
        ->toThrow(DomainException::class, 'may be completed');
});

test('a cancelled deal cannot be completed', function () {
    $deal = Deal::factory()->create([
        'status' => DealStatus::Cancelled,
    ]);

    expect(fn () => app(CompleteDeal::class)->handle($deal))
        ->toThrow(DomainException::class, 'may be completed');
});

test('deal lifecycle cannot skip required timestamps or regress', function () {
    $deal = Deal::factory()->create();

    expect(fn () => $deal->update([
        'status' => DealStatus::Completed,
    ]))->toThrow(LogicException::class, 'requires a completion timestamp');

    $completedDeal = app(CompleteDeal::class)->handle($deal);

    expect(fn () => $completedDeal->update([
        'status' => DealStatus::InProgress,
    ]))->toThrow(LogicException::class, 'status transition is invalid');

    $completedDeal->refresh();

    expect(fn () => $completedDeal->update([
        'completed_at' => now()->addDay(),
    ]))->toThrow(LogicException::class, 'completion timestamp is immutable');
});
