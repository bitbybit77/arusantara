<?php

namespace App\Models\Messaging;

use App\Messaging\ConversationStatus;
use App\Models\User;
use Database\Factories\Messaging\MessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

#[Fillable(['conversation_id', 'sender_user_id', 'message', 'attachment_path', 'read_at'])]
class Message extends Model
{
    /** @use HasFactory<MessageFactory> */
    use HasFactory;

    /** @return BelongsTo<Conversation, $this> */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /** @return BelongsTo<User, $this> */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    protected static function booted(): void
    {
        static::creating(function (self $message): void {
            $conversation = Conversation::query()
                ->with('makerProfile:id,user_id')
                ->whereKey($message->getAttribute('conversation_id'))
                ->first();

            if ($conversation === null || $conversation->status !== ConversationStatus::Active) {
                throw new LogicException('Messages require an active negotiation conversation.');
            }

            $senderId = (int) $message->getAttribute('sender_user_id');
            $makerUserId = (int) $conversation->makerProfile->user_id;

            if ($senderId !== (int) $conversation->customer_id && $senderId !== $makerUserId) {
                throw new LogicException('A message sender must participate in its conversation.');
            }

            $body = $message->getAttribute('message');

            if (! is_string($body) || trim($body) === '') {
                throw new LogicException('A message body is required.');
            }
        });

        static::updating(function (self $message): void {
            if ($message->isDirty([
                'conversation_id',
                'sender_user_id',
                'message',
                'attachment_path',
            ])) {
                throw new LogicException('Message context and content are immutable.');
            }

            if ($message->getRawOriginal('read_at') !== null && $message->isDirty('read_at')) {
                throw new LogicException('A message read timestamp is immutable once recorded.');
            }
        });

        static::deleting(function (): never {
            throw new LogicException('Negotiation messages preserve transaction history and cannot be deleted.');
        });
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }
}
