<?php

namespace App\Models\Procurement;

use App\Procurement\TechnicalDeviationStatus;
use Database\Factories\Procurement\TechnicalDeviationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * @property int $id
 * @property int $quotation_revision_id
 * @property string $baseline_reference
 * @property string $requested_specification
 * @property string $proposed_specification
 * @property string $reason
 * @property string $price_impact
 * @property int $lead_time_impact_days
 * @property TechnicalDeviationStatus $status
 * @property Carbon|null $responded_at
 * @property-read QuotationRevision $quotationRevision
 */
#[Fillable([
    'quotation_revision_id',
    'baseline_reference',
    'requested_specification',
    'proposed_specification',
    'reason',
    'price_impact',
    'lead_time_impact_days',
    'status',
    'responded_at',
])]
class TechnicalDeviation extends Model
{
    /** @use HasFactory<TechnicalDeviationFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'price_impact' => '0',
        'lead_time_impact_days' => 0,
        'status' => 'pending',
    ];

    /**
     * @param  array<string, mixed>  $options
     */
    public function save(array $options = []): bool
    {
        if (! $this->exists || $this->getConnection()->transactionLevel() > 0) {
            return parent::save($options);
        }

        return (bool) $this->getConnection()->transaction(
            fn (): bool => parent::save($options),
            3,
        );
    }

    /** @return BelongsTo<QuotationRevision, $this> */
    public function quotationRevision(): BelongsTo
    {
        return $this->belongsTo(QuotationRevision::class);
    }

    protected static function booted(): void
    {
        static::creating(function (self $deviation): void {
            $deviation->ensureRevisionIsDraft();
            $deviation->ensurePendingResponseState();
        });

        static::updating(function (self $deviation): void {
            if ($deviation->isDirty('quotation_revision_id')) {
                throw new LogicException('A technical deviation cannot be moved to another revision.');
            }

            $deviation->ensureSubmittedRevisionChangesAreAResponse();
        });

        static::deleting(fn (self $deviation) => $deviation->ensureRevisionIsDraft());
    }

    private function ensureRevisionIsDraft(): void
    {
        if ($this->anyReferencedRevisionIsSubmitted()) {
            throw new LogicException('Technical deviations cannot be added to or removed from submitted revisions.');
        }
    }

    private function ensureSubmittedRevisionChangesAreAResponse(): void
    {
        if ($this->referencedRevisionHasDeal()) {
            throw new LogicException('Technical deviations on an accepted deal are immutable.');
        }

        if (! $this->anyReferencedRevisionIsSubmitted()) {
            $this->ensurePendingResponseState();

            return;
        }

        $changedFields = array_keys($this->getDirty());
        $responseFields = ['status', 'responded_at'];

        if (array_diff($changedFields, $responseFields) !== []) {
            throw new LogicException('Only the response to a submitted technical deviation may change.');
        }

        $originalStatus = self::query()
            ->whereKey($this->getKey())
            ->lockForUpdate()
            ->firstOrFail()
            ->currentStatus();

        if ($originalStatus !== TechnicalDeviationStatus::Pending) {
            throw new LogicException('A technical deviation response is final and cannot be changed.');
        }

        if (! in_array($this->currentStatus(), [
            TechnicalDeviationStatus::Accepted,
            TechnicalDeviationStatus::Rejected,
        ], true) || $this->responded_at === null) {
            throw new LogicException('A submitted technical deviation requires a final response and response timestamp.');
        }
    }

    private function ensurePendingResponseState(): void
    {
        if ($this->currentStatus() !== TechnicalDeviationStatus::Pending || $this->responded_at !== null) {
            throw new LogicException('A draft technical deviation must begin pending without a response timestamp.');
        }
    }

    private function anyReferencedRevisionIsSubmitted(): bool
    {
        $revisionIds = array_values(array_unique(array_filter([
            $this->quotation_revision_id,
            $this->getRawOriginal('quotation_revision_id'),
        ])));

        return QuotationRevision::query()
            ->whereKey($revisionIds)
            ->whereNotNull('submitted_at')
            ->exists();
    }

    private function referencedRevisionHasDeal(): bool
    {
        $revisionIds = array_values(array_unique(array_filter([
            $this->quotation_revision_id,
            $this->getRawOriginal('quotation_revision_id'),
        ])));

        return Deal::query()
            ->whereIn('quotation_revision_id', $revisionIds)
            ->exists();
    }

    private function currentStatus(): TechnicalDeviationStatus
    {
        $status = $this->getAttribute('status');

        if ($status instanceof TechnicalDeviationStatus) {
            return $status;
        }

        if (is_string($status)) {
            return TechnicalDeviationStatus::from($status);
        }

        throw new LogicException('Technical deviation status is invalid.');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'price_impact' => 'decimal:2',
            'lead_time_impact_days' => 'integer',
            'status' => TechnicalDeviationStatus::class,
            'responded_at' => 'datetime',
        ];
    }
}
