<?php

use App\Models\Configuration\Project;
use App\Models\Identity\MakerProfile;
use App\Models\Messaging\Conversation;
use App\Models\Procurement\Deal;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Models\Trust\MakerReview;
use App\Models\User;
use App\VerificationStatus;

test('starter kit authentication secrets remain hidden', function () {
    $user = User::factory()->make();

    expect($user->getHidden())
        ->toContain('password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes');
});

test('maker profiles reject direct ownership by non-maker users', function () {
    $customer = User::factory()->customer()->create();

    expect(fn () => MakerProfile::query()->create([
        'user_id' => $customer->id,
        'business_name' => 'Invalid customer-owned profile',
    ]))->toThrow(LogicException::class, 'must belong to a maker user');
});

test('maker profile ownership cannot be reassigned', function () {
    $profile = MakerProfile::factory()->create();
    $originalOwnerId = $profile->user_id;
    $replacementMaker = User::factory()->maker()->create();

    expect(fn () => $profile->update([
        'user_id' => $replacementMaker->id,
    ]))->toThrow(LogicException::class, 'cannot be reassigned')
        ->and($profile->fresh()->user_id)->toBe($originalOwnerId);
});

test('maker profile verification status and timestamp must agree', function () {
    $maker = User::factory()->maker()->create();

    expect(fn () => MakerProfile::factory()->for($maker)->create([
        'verification_status' => VerificationStatus::Verified,
        'verified_at' => null,
    ]))->toThrow(LogicException::class, 'timestamp must be present only when verified')
        ->and(fn () => MakerProfile::factory()->for($maker)->create([
            'verification_status' => VerificationStatus::Pending,
            'verified_at' => now(),
        ]))->toThrow(LogicException::class, 'timestamp must be present only when verified');
});

test('projects reject non-customer owners and immutable ownership changes', function () {
    $maker = User::factory()->maker()->create();

    expect(fn () => Project::factory()->for($maker, 'customer')->create())
        ->toThrow(LogicException::class, 'must belong to a customer user');

    $project = Project::factory()->create();
    $originalCustomerId = $project->customer_id;
    $replacementCustomer = User::factory()->customer()->create();

    expect(fn () => $project->update([
        'customer_id' => $replacementCustomer->id,
    ]))->toThrow(LogicException::class, 'cannot be reassigned')
        ->and($project->fresh()->customer_id)->toBe($originalCustomerId);
});

test('identity roots expose project and maker marketplace inverse relationships', function () {
    $customer = User::factory()->customer()->create();
    $project = Project::factory()->for($customer, 'customer')->create();
    $makerProfile = MakerProfile::factory()->verified()->create();
    $quotation = Quotation::factory()->submitted()->for($makerProfile, 'maker')->create();
    $conversation = Conversation::factory()->forQuotation($quotation)->create();
    $quotationRevision = QuotationRevision::factory()->submitted()->for($quotation)->create();
    $deal = Deal::factory()->completed()->create([
        'quotation_revision_id' => $quotationRevision->id,
    ]);
    $review = MakerReview::factory()->create([
        'deal_id' => $deal->id,
    ]);

    expect($customer->projects->modelKeys())->toContain($project->id)
        ->and($makerProfile->quotations->modelKeys())->toContain($quotation->id)
        ->and($makerProfile->conversations->modelKeys())->toContain($conversation->id)
        ->and($makerProfile->deals->modelKeys())->toContain($deal->id)
        ->and($makerProfile->reviews->modelKeys())->toContain($review->id);
});
