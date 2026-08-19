<?php

namespace App\Actions\Messaging;

use App\Messaging\ConversationStatus;
use App\Models\Messaging\Conversation;
use App\Models\Messaging\Message;
use App\Models\User;
use DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SendMessage
{
    public function handle(
        Conversation $conversation,
        User $sender,
        string $message,
        ?string $attachmentPath = null,
    ): Message {
        $normalizedMessage = Str::of($message)->trim()->toString();

        if ($normalizedMessage === '') {
            throw ValidationException::withMessages([
                'message' => 'The message field is required.',
            ]);
        }

        return DB::transaction(function () use (
            $conversation,
            $sender,
            $normalizedMessage,
            $attachmentPath,
        ): Message {
            $lockedConversation = Conversation::query()
                ->whereKey($conversation->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedConversation->status !== ConversationStatus::Active) {
                throw new DomainException('Messages cannot be sent to a closed conversation.');
            }

            $makerUserId = $lockedConversation->makerProfile()->value('user_id');

            if ((int) $sender->getKey() !== (int) $lockedConversation->customer_id
                && (int) $sender->getKey() !== (int) $makerUserId) {
                throw new AuthorizationException('Only conversation participants may send messages.');
            }

            return $lockedConversation->messages()->create([
                'sender_user_id' => $sender->getKey(),
                'message' => $normalizedMessage,
                'attachment_path' => $attachmentPath,
            ]);
        }, 3);
    }
}
