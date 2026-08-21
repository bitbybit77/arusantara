<?php

use App\Messaging\ConversationStatus;
use App\Models\Messaging\Conversation;
use App\Models\Messaging\Message;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\Rfq;
use App\Models\User;
use Illuminate\Database\QueryException;
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
        ->toThrow(QueryException::class);
});

test('message records independently enforce participants and preserve negotiation history', function () {
    $conversation = Conversation::factory()->create();

    expect(fn () => Message::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_user_id' => User::factory()->customer()->create()->id,
    ]))->toThrow(LogicException::class, 'must participate');

    $message = Message::factory()->create([
        'conversation_id' => $conversation->id,
    ]);

    $message->update(['read_at' => now()]);

    expect($message->read_at)->not->toBeNull()
        ->and(fn () => $message->update(['message' => 'Rewritten negotiation history.']))
        ->toThrow(LogicException::class, 'context and content are immutable')
        ->and(fn () => $message->fresh()->update(['read_at' => now()->addMinute()]))
        ->toThrow(LogicException::class, 'immutable once recorded')
        ->and(fn () => $message->delete())
        ->toThrow(LogicException::class, 'cannot be deleted');
});

test('a stale conversation cannot rewrite a persisted closure', function () {
    $conversation = Conversation::factory()->create();
    $staleConversation = Conversation::query()->findOrFail($conversation->id);

    $conversation->update(['status' => ConversationStatus::Closed]);

    expect(fn () => $staleConversation->update(['status' => ConversationStatus::Closed]))
        ->toThrow(LogicException::class, 'Closed conversation history is immutable');
});
