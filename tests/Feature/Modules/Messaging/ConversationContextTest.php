<?php

use App\Actions\Messaging\CreateConversation;
use App\Actions\Messaging\SendMessage;
use App\Messaging\ConversationStatus;
use App\Models\Identity\MakerProfile;
use App\Models\Messaging\Conversation;
use App\Models\Messaging\Message;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\Rfq;

test('conversation context is derived from its rfq and optional quotation', function () {
    $rfq = Rfq::factory()->create();
    $maker = MakerProfile::factory()->create();

    $conversation = app(CreateConversation::class)->handle($rfq, $maker);

    expect($conversation->rfq->is($rfq))->toBeTrue()
        ->and($conversation->customer->is($rfq->customer))->toBeTrue()
        ->and($conversation->makerProfile->is($maker))->toBeTrue()
        ->and($conversation->quotation)->toBeNull()
        ->and($conversation->status)->toBe(ConversationStatus::Active);

    $quotation = Quotation::factory()->create();
    $quotationConversation = app(CreateConversation::class)->handle(
        $quotation->rfq,
        $quotation->maker,
        $quotation,
    );

    expect($quotationConversation->rfq->is($quotation->rfq))->toBeTrue()
        ->and($quotationConversation->quotation->is($quotation))->toBeTrue()
        ->and($quotationConversation->customer->is($quotation->rfq->customer))->toBeTrue()
        ->and($quotationConversation->makerProfile->is($quotation->maker))->toBeTrue();
});

test('conversation creation rejects a quotation from another rfq or maker', function () {
    $quotation = Quotation::factory()->create();

    expect(fn () => app(CreateConversation::class)->handle(
        Rfq::factory()->create(),
        $quotation->maker,
        $quotation,
    ))->toThrow(DomainException::class)
        ->and(fn () => app(CreateConversation::class)->handle(
            $quotation->rfq,
            MakerProfile::factory()->create(),
            $quotation,
        ))->toThrow(DomainException::class);
});

test('messaging factories always use conversation participants', function () {
    $conversation = Conversation::factory()->create();
    $customerMessage = Message::factory()->create([
        'conversation_id' => $conversation->getKey(),
    ]);
    $makerMessage = Message::factory()->fromMaker()->create([
        'conversation_id' => $conversation->getKey(),
    ]);

    expect($conversation->customer->is($conversation->rfq->customer))->toBeTrue()
        ->and($customerMessage->sender->is($conversation->customer))->toBeTrue()
        ->and($makerMessage->sender->is($conversation->makerProfile->user))->toBeTrue();

    $quotation = Quotation::factory()->create();
    $quotationConversation = Conversation::factory()->forQuotation($quotation)->create();

    expect($quotationConversation->rfq->is($quotation->rfq))->toBeTrue()
        ->and($quotationConversation->quotation->is($quotation))->toBeTrue()
        ->and($quotationConversation->customer->is($quotation->rfq->customer))->toBeTrue()
        ->and($quotationConversation->makerProfile->is($quotation->maker))->toBeTrue();
});

test('sending a message reloads and locks the latest conversation state', function () {
    $conversation = Conversation::factory()->create();
    $staleConversation = Conversation::query()->findOrFail($conversation->getKey());

    Conversation::query()->whereKey($conversation->getKey())->update([
        'status' => ConversationStatus::Closed,
        'closed_at' => now(),
    ]);

    expect(fn () => app(SendMessage::class)->handle(
        $staleConversation,
        $conversation->customer,
        'This stale model must not bypass the close.',
    ))->toThrow(DomainException::class)
        ->and($conversation->messages()->count())->toBe(0);
});
