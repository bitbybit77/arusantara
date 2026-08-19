<?php

namespace App\Models\Procurement;

use App\Models\Identity\MakerProfile;
use App\Models\Trust\MakerReview;
use App\Models\User;
use App\Procurement\DealStatus;
use Database\Factories\Procurement\DealFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * @property int $id
 * @property int $rfq_id
 * @property int $quotation_id
 * @property int $quotation_revision_id
 * @property int $customer_id
 * @property int $maker_profile_id
 * @property string $number
 * @property DealStatus $status
 * @property string $currency_code
 * @property string $agreed_value
 * @property int|null $lead_time_days
 * @property int|null $warranty_months
 * @property array<string, mixed> $technical_snapshot
 * @property array<string, mixed> $commercial_snapshot
 * @property Carbon $accepted_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $closed_at
 * @property-read Rfq $rfq
 * @property-read Quotation $quotation
 * @property-read QuotationRevision $quotationRevision
 * @property-read User $customer
 * @property-read MakerProfile $maker
 */
#[Fillable([
    'rfq_id',
    'quotation_id',
    'quotation_revision_id',
    'customer_id',
    'maker_profile_id',
    'number',
    'status',
    'currency_code',
    'agreed_value',
    'lead_time_days',
    'warranty_months',
    'technical_snapshot',
    'commercial_snapshot',
    'accepted_at',
    'completed_at',
    'closed_at',
])]
class Deal extends Model
{
    /** @use HasFactory<DealFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => 'accepted',
    ];

    /** @var list<string> */
    private const IMMUTABLE_FIELDS = [
        'rfq_id',
        'quotation_id',
        'quotation_revision_id',
        'customer_id',
        'maker_profile_id',
        'number',
        'currency_code',
        'agreed_value',
        'lead_time_days',
        'warranty_months',
        'technical_snapshot',
        'commercial_snapshot',
        'accepted_at',
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

    /** @return BelongsTo<QuotationRevision, $this> */
    public function quotationRevision(): BelongsTo
    {
        return $this->belongsTo(QuotationRevision::class);
    }

    /** @return BelongsTo<User, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /** @return BelongsTo<MakerProfile, $this> */
    public function maker(): BelongsTo
    {
        return $this->belongsTo(MakerProfile::class, 'maker_profile_id');
    }

    /** @return HasOne<MakerReview, $this> */
    public function review(): HasOne
    {
        return $this->hasOne(MakerReview::class);
    }

    protected static function booted(): void
    {
        static::creating(function (self $deal): void {
            $deal->ensureAggregateIsConsistent();
            $deal->ensureInitialLifecycleStateIsCoherent();
        });

        static::updating(function (self $deal): void {
            if ($deal->isDirty(self::IMMUTABLE_FIELDS)) {
                throw new LogicException('The accepted terms and snapshots of a deal are immutable.');
            }

            $deal->ensureLifecycleTransitionIsValid();
        });

        static::deleting(function (): never {
            throw new LogicException('Deals preserve accepted transaction history and cannot be deleted.');
        });
    }

    private function ensureAggregateIsConsistent(): void
    {
        $rfq = Rfq::query()->find($this->rfq_id);
        $quotation = Quotation::query()->find($this->quotation_id);
        $revision = QuotationRevision::query()->find($this->quotation_revision_id);

        if ($rfq === null
            || $quotation === null
            || $revision === null
            || (int) $quotation->rfq_id !== (int) $rfq->getKey()
            || (int) $revision->quotation_id !== (int) $quotation->getKey()
            || (int) $rfq->customer_id !== (int) $this->customer_id
            || (int) $quotation->maker_profile_id !== (int) $this->maker_profile_id) {
            throw new LogicException('A deal must preserve one coherent RFQ, quotation, revision, customer, and maker aggregate.');
        }

        if ($revision->submitted_at === null) {
            throw new LogicException('A deal requires a submitted quotation revision.');
        }

        if ($this->currency_code !== $revision->currency_code
            || (string) $this->agreed_value !== (string) $revision->grand_total
            || $this->lead_time_days !== $revision->lead_time_days
            || $this->warranty_months !== $revision->warranty_months) {
            throw new LogicException('Deal terms must match the accepted quotation revision.');
        }

        if (! is_array($this->technical_snapshot)
            || $this->technical_snapshot === []
            || ! is_array($this->commercial_snapshot)
            || $this->commercial_snapshot === []) {
            throw new LogicException('A deal requires frozen technical and commercial snapshots.');
        }
    }

    private function ensureInitialLifecycleStateIsCoherent(): void
    {
        if ($this->accepted_at === null) {
            throw new LogicException('A deal requires an acceptance timestamp.');
        }

        if ($this->status === DealStatus::Completed && $this->completed_at === null) {
            throw new LogicException('A completed deal requires a completion timestamp.');
        }

        if ($this->status === DealStatus::Closed
            && ($this->completed_at === null || $this->closed_at === null)) {
            throw new LogicException('A closed deal requires completion and closure timestamps.');
        }
    }

    private function ensureLifecycleTransitionIsValid(): void
    {
        $originalStatus = DealStatus::from((string) $this->getRawOriginal('status'));
        $currentStatus = $this->status;

        if ($this->isDirty('status')) {
            $allowedTransitions = match ($originalStatus) {
                DealStatus::Accepted => [DealStatus::InProgress, DealStatus::Completed, DealStatus::Cancelled],
                DealStatus::InProgress => [DealStatus::Completed, DealStatus::Cancelled],
                DealStatus::Completed => [DealStatus::Closed],
                DealStatus::Cancelled, DealStatus::Closed => [],
            };

            if (! in_array($currentStatus, $allowedTransitions, true)) {
                throw new LogicException('The requested deal status transition is invalid.');
            }
        }

        if ($this->getRawOriginal('completed_at') !== null && $this->isDirty('completed_at')) {
            throw new LogicException('A deal completion timestamp is immutable.');
        }

        if ($currentStatus === DealStatus::Completed && $this->completed_at === null) {
            throw new LogicException('A completed deal requires a completion timestamp.');
        }

        if ($this->isDirty('completed_at') && $currentStatus !== DealStatus::Completed) {
            throw new LogicException('Only a completed deal may have a completion timestamp.');
        }

        if ($this->getRawOriginal('closed_at') !== null && $this->isDirty('closed_at')) {
            throw new LogicException('A deal closure timestamp is immutable.');
        }

        if ($currentStatus === DealStatus::Closed && $this->closed_at === null) {
            throw new LogicException('A closed deal requires a closure timestamp.');
        }

        if ($this->isDirty('closed_at') && $currentStatus !== DealStatus::Closed) {
            throw new LogicException('Only a closed deal may have a closure timestamp.');
        }
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => DealStatus::class,
            'agreed_value' => 'decimal:2',
            'lead_time_days' => 'integer',
            'warranty_months' => 'integer',
            'technical_snapshot' => 'array',
            'commercial_snapshot' => 'array',
            'accepted_at' => 'datetime',
            'completed_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}
