<?php

namespace App\Models\Messaging;

use App\Messaging\ConversationStatus;
use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\Rfq;
use App\Models\User;
use Database\Factories\Messaging\ConversationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * @property int $id
 * @property int $rfq_id
 * @property int|null $quotation_id
 * @property int $customer_id
 * @property int $maker_profile_id
 * @property ConversationStatus $status
 * @property Carbon|null $closed_at
 */
#[Fillable(['rfq_id', 'quotation_id', 'customer_id', 'maker_profile_id', 'status', 'closed_at'])]
class Conversation extends Model
{
    /** @use HasFactory<ConversationFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => 'active',
    ];

    /** @return BelongsTo<Rfq, $this> */
    public function rfq(): BelongsTo
    {
        return $this->belongsTo(Rfq::class);
    }

    /** @return BelongsTo<Quotation, $this> */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /** @return BelongsTo<User, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /** @return BelongsTo<MakerProfile, $this> */
    public function makerProfile(): BelongsTo
    {
        return $this->belongsTo(MakerProfile::class);
    }

    /** @return HasMany<Message, $this> */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    protected static function booted(): void
    {
        static::saving(function (self $conversation): void {
            if ($conversation->currentStatus() === ConversationStatus::Closed
                && $conversation->closed_at === null) {
                $conversation->closed_at = now();
            }

            $conversation->ensureLifecycleTimestampsAreCoherent();
        });

        static::creating(fn (self $conversation) => $conversation->ensureContextIsConsistent());

        static::updating(function (self $conversation): void {
            if ($conversation->isDirty(['rfq_id', 'customer_id', 'maker_profile_id'])) {
                throw new LogicException('Conversation RFQ and participants are immutable.');
            }

            if ($conversation->isDirty('quotation_id')) {
                if ($conversation->getRawOriginal('quotation_id') !== null) {
                    throw new LogicException('A conversation quotation cannot be replaced.');
                }

                $conversation->ensureContextIsConsistent();
            }

            if ($conversation->isDirty('status')) {
                $originalStatus = ConversationStatus::from((string) $conversation->getRawOriginal('status'));

                if ($originalStatus !== ConversationStatus::Active
                    || $conversation->currentStatus() !== ConversationStatus::Closed) {
                    throw new LogicException('The requested conversation status transition is invalid.');
                }
            }

            if ($conversation->getRawOriginal('closed_at') !== null
                && $conversation->isDirty('closed_at')) {
                throw new LogicException('A conversation closure timestamp is immutable.');
            }
        });

        static::deleting(function (): never {
            throw new LogicException('Conversation history cannot be deleted.');
        });
    }

    private function ensureContextIsConsistent(): void
    {
        $rfq = Rfq::query()->find($this->rfq_id);

        if ($rfq === null || (int) $rfq->customer_id !== (int) $this->customer_id) {
            throw new LogicException('A conversation customer must own its RFQ.');
        }

        if (! MakerProfile::query()->whereKey($this->maker_profile_id)->exists()) {
            throw new LogicException('A conversation requires a maker profile.');
        }

        if ($this->quotation_id === null) {
            return;
        }

        $quotationMatchesContext = Quotation::query()
            ->whereKey($this->quotation_id)
            ->where('rfq_id', $this->rfq_id)
            ->where('maker_profile_id', $this->maker_profile_id)
            ->exists();

        if (! $quotationMatchesContext) {
            throw new LogicException('A conversation quotation must belong to its RFQ and maker.');
        }
    }

    private function ensureLifecycleTimestampsAreCoherent(): void
    {
        if ($this->currentStatus() === ConversationStatus::Active && $this->closed_at !== null) {
            throw new LogicException('An active conversation cannot have a closure timestamp.');
        }

        if ($this->currentStatus() === ConversationStatus::Closed && $this->closed_at === null) {
            throw new LogicException('A closed conversation requires a closure timestamp.');
        }
    }

    private function currentStatus(): ConversationStatus
    {
        $status = $this->getAttribute('status');

        if ($status instanceof ConversationStatus) {
            return $status;
        }

        if (is_string($status)) {
            return ConversationStatus::from($status);
        }

        throw new LogicException('Conversation status is invalid.');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => ConversationStatus::class,
            'closed_at' => 'datetime',
        ];
    }
}
