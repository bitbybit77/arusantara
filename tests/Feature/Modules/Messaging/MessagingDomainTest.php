<?php

use App\Actions\Messaging\SendMessage;
use App\Messaging\ConversationStatus;
use App\Models\Messaging\Conversation;
use App\Models\Procurement\Quotation;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Schema;

test('messaging schema is scoped to rfq and quotation negotiation', function () {
    expect(Schema::hasColumns('conversations', [
        'id', 'rfq_id', 'quotation_id', 'customer_id', 'maker_profile_id', 'status', 'closed_at',
    ]))->toBeTrue()
        ->and(Schema::hasColumns('messages', [
            'id', 'conversation_id', 'sender_user_id', 'message', 'attachment_path', 'read_at', 'created_at',
        ]))->toBeTrue()
        ->and(Schema::hasIndex('conversations', ['rfq_id', 'maker_profile_id'], 'unique'))->toBeTrue()
        ->and(Schema::hasIndex('conversations', ['quotation_id'], 'unique'))->toBeTrue()
        ->and(Schema::hasIndex('messages', ['conversation_id', 'created_at']))->toBeTrue();
});

test('only the customer and maker in a negotiation may send messages', function () {
    $quotation = Quotation::factory()->create();
    $customer = $quotation->rfq->customer;
    $makerUser = $quotation->maker->user;

    $conversation = Conversation::factory()->create([
        'rfq_id' => $quotation->rfq_id,
        'quotation_id' => $quotation->id,
        'customer_id' => $customer->id,
        'maker_profile_id' => $quotation->maker_profile_id,
    ]);

    $action = app(SendMessage::class);
    $customerMessage = $action->handle($conversation, $customer, 'Can you explain the proposed MCCB?');
    $makerMessage = $action->handle($conversation, $makerUser, 'Yes, this rating follows the RFQ baseline.');

    expect($conversation->rfq->is($quotation->rfq))->toBeTrue()
        ->and($conversation->quotation->is($quotation))->toBeTrue()
        ->and($conversation->messages)->toHaveCount(2)
        ->and($customerMessage->sender->is($customer))->toBeTrue()
        ->and($makerMessage->sender->is($makerUser))->toBeTrue()
        ->and(fn () => $action->handle(
            $conversation,
            User::factory()->create(),
            'I should not be able to send this.',
        ))->toThrow(AuthorizationException::class);
});

test('closed negotiation conversations reject new messages', function () {
    $quotation = Quotation::factory()->create();
    $conversation = Conversation::factory()->create([
        'rfq_id' => $quotation->rfq_id,
        'quotation_id' => $quotation->id,
        'customer_id' => $quotation->rfq->customer_id,
        'maker_profile_id' => $quotation->maker_profile_id,
        'status' => ConversationStatus::Closed,
        'closed_at' => now(),
    ]);

    expect(fn () => app(SendMessage::class)->handle(
        $conversation,
        $quotation->rfq->customer,
        'This conversation is closed.',
    ))->toThrow(DomainException::class);
});
