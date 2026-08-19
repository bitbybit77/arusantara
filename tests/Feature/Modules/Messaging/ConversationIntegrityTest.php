<?php

use App\Messaging\ConversationStatus;
use App\Models\Messaging\Conversation;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\Rfq;
use App\Models\User;
use Illuminate\Support\Facades\DB;

test('conversation context is immutable and must remain within one RFQ maker aggregate', function () {
    $quotation = Quotation::factory()->create();
    $conversation = Conversation::factory()->forQuotation($quotation)->create();

    expect(fn () => $conversation->update([
        'rfq_id' => Rfq::factory()->create()->id,
    ]))->toThrow(LogicException::class, 'participants are immutable')
        ->and(fn () => $conversation->update([
            'customer_id' => User::factory()->customer()->create()->id,
        ]))->toThrow(LogicException::class, 'participants are immutable');

    $unrelatedQuotation = Quotation::factory()->create();

    expect(fn () => Conversation::factory()->create([
        'rfq_id' => $quotation->rfq_id,
        'quotation_id' => $unrelatedQuotation->id,
        'customer_id' => $quotation->rfq->customer_id,
        'maker_profile_id' => $quotation->maker_profile_id,
    ]))->toThrow(LogicException::class, 'must belong to its RFQ and maker');
});

test('conversation lifecycle only closes once and preserves history', function () {
    $conversation = Conversation::factory()->create();

    $conversation->update(['status' => ConversationStatus::Closed]);

    expect($conversation->status)->toBe(ConversationStatus::Closed)
        ->and($conversation->closed_at)->not->toBeNull()
        ->and(fn () => $conversation->update(['status' => ConversationStatus::Active]))
        ->toThrow(LogicException::class)
        ->and(fn () => $conversation->delete())
        ->toThrow(LogicException::class, 'history cannot be deleted');
});

test('database constraints reject a quotation outside conversation context', function () {
    $conversation = Conversation::factory()->create();
    $unrelatedQuotation = Quotation::factory()->create();

    expect(fn () => DB::table('conversations')
        ->where('id', $conversation->id)
        ->update(['quotation_id' => $unrelatedQuotation->id]))
        ->toThrow(Throwable::class);
});
