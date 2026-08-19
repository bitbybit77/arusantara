<?php

namespace App\Models\Procurement;

use App\Models\Identity\MakerProfile;
use App\Models\Messaging\Conversation;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use Database\Factories\Procurement\QuotationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use LogicException;

/**
 * @property int $id
 * @property int $rfq_id
 * @property int $maker_profile_id
 * @property int|null $current_revision_id
 * @property string $number
 * @property QuotationStatus $status
 * @property-read Rfq $rfq
 * @property-read MakerProfile $maker
 * @property-read QuotationRevision|null $currentRevision
 */
#[Fillable(['rfq_id', 'maker_profile_id', 'number', 'status', 'current_revision_id'])]
class Quotation extends Model
{
    /** @use HasFactory<QuotationFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => 'draft',
    ];

    /** @return BelongsTo<Rfq, $this> */
    public function rfq(): BelongsTo
    {
        return $this->belongsTo(Rfq::class);
    }

    /** @return BelongsTo<MakerProfile, $this> */
    public function maker(): BelongsTo
    {
        return $this->belongsTo(MakerProfile::class, 'maker_profile_id');
    }

    /** @return BelongsTo<QuotationRevision, $this> */
    public function currentRevision(): BelongsTo
    {
        return $this->belongsTo(QuotationRevision::class, 'current_revision_id');
    }

    /** @return HasMany<QuotationRevision, $this> */
    public function revisions(): HasMany
    {
        return $this->hasMany(QuotationRevision::class);
    }

    /** @return HasOne<Deal, $this> */
    public function deal(): HasOne
    {
        return $this->hasOne(Deal::class);
    }

    /** @return HasOne<Conversation, $this> */
    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class);
    }

    protected static function booted(): void
    {
        static::creating(function (self $quotation): void {
            if ($quotation->currentStatus() !== QuotationStatus::Draft
                || $quotation->current_revision_id !== null) {
                throw new LogicException('A quotation must be created as a draft without a current revision.');
            }

            $quotation->ensureRfqAcceptsQuotations();
        });

        static::updating(function (self $quotation): void {
            if ($quotation->isDirty(['rfq_id', 'maker_profile_id'])) {
                throw new LogicException('A quotation RFQ and maker are immutable.');
            }

            $quotation->ensureLifecycleTransitionIsValid();
            $quotation->ensureCurrentRevisionIsCoherent();
        });
    }

    private function ensureRfqAcceptsQuotations(): void
    {
        $rfqAcceptsQuotations = Rfq::query()
            ->whereKey($this->rfq_id)
            ->whereIn('status', [
                RfqStatus::Open->value,
                RfqStatus::Negotiating->value,
            ])
            ->exists();

        if (! $rfqAcceptsQuotations) {
            throw new LogicException('Quotations may only be created for an open or negotiating RFQ.');
        }
    }

    private function ensureLifecycleTransitionIsValid(): void
    {
        if (! $this->isDirty('status')) {
            return;
        }

        $originalStatus = QuotationStatus::from((string) $this->getRawOriginal('status'));
        $currentStatus = $this->currentStatus();
        $allowedTransitions = match ($originalStatus) {
            QuotationStatus::Draft => [QuotationStatus::Submitted, QuotationStatus::Withdrawn],
            QuotationStatus::Submitted => [
                QuotationStatus::Negotiating,
                QuotationStatus::Accepted,
                QuotationStatus::Rejected,
                QuotationStatus::Withdrawn,
            ],
            QuotationStatus::Negotiating => [
                QuotationStatus::Submitted,
                QuotationStatus::Accepted,
                QuotationStatus::Rejected,
                QuotationStatus::Withdrawn,
            ],
            QuotationStatus::Accepted, QuotationStatus::Rejected, QuotationStatus::Withdrawn => [],
        };

        if (! in_array($currentStatus, $allowedTransitions, true)) {
            throw new LogicException('The requested quotation status transition is invalid.');
        }
    }

    private function ensureCurrentRevisionIsCoherent(): void
    {
        $status = $this->currentStatus();

        if ($status === QuotationStatus::Draft) {
            if ($this->current_revision_id !== null) {
                throw new LogicException('A draft quotation cannot have a current submitted revision.');
            }

            return;
        }

        if ($status === QuotationStatus::Withdrawn && $this->current_revision_id === null) {
            return;
        }

        if ($this->current_revision_id === null) {
            throw new LogicException('This quotation status requires a current submitted revision.');
        }

        $hasSubmittedOwnedRevision = $this->revisions()
            ->whereKey($this->current_revision_id)
            ->whereNotNull('submitted_at')
            ->exists();

        if (! $hasSubmittedOwnedRevision) {
            throw new LogicException('The current quotation revision must be submitted and belong to the quotation.');
        }
    }

    private function currentStatus(): QuotationStatus
    {
        $status = $this->getAttribute('status');

        if ($status instanceof QuotationStatus) {
            return $status;
        }

        if (is_string($status)) {
            return QuotationStatus::from($status);
        }

        throw new LogicException('Quotation status is invalid.');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => QuotationStatus::class,
        ];
    }
}
