<?php

namespace App\Models\Procurement;

use App\Models\Configuration\Project;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Messaging\Conversation;
use App\Models\User;
use App\Procurement\RfqStatus;
use Database\Factories\Procurement\RfqFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * @property int $id
 * @property int $project_id
 * @property int $calculation_snapshot_id
 * @property int $customer_id
 * @property string $number
 * @property string $title
 * @property RfqStatus $status
 * @property array<string, mixed> $requirements
 * @property string|null $installation_location
 * @property Carbon|null $published_at
 * @property Carbon|null $due_at
 * @property Carbon|null $closed_at
 * @property-read Project $project
 * @property-read CalculationSnapshot $calculationSnapshot
 * @property-read User $customer
 * @property-read Deal|null $deal
 */
#[Fillable([
    'project_id',
    'calculation_snapshot_id',
    'customer_id',
    'number',
    'title',
    'status',
    'requirements',
    'installation_location',
    'published_at',
    'due_at',
    'closed_at',
])]
class Rfq extends Model
{
    /** @use HasFactory<RfqFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => 'draft',
        'requirements' => '[]',
    ];

    /** @var list<string> */
    private const BASELINE_FIELDS = [
        'project_id',
        'calculation_snapshot_id',
        'customer_id',
    ];

    /** @var list<string> */
    private const TECHNICAL_BRIEF_FIELDS = [
        'title',
        'requirements',
        'installation_location',
    ];

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** @return BelongsTo<CalculationSnapshot, $this> */
    public function calculationSnapshot(): BelongsTo
    {
        return $this->belongsTo(CalculationSnapshot::class);
    }

    /** @return BelongsTo<User, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /** @return HasMany<Quotation, $this> */
    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    /** @return HasMany<Conversation, $this> */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /** @return HasOne<Deal, $this> */
    public function deal(): HasOne
    {
        return $this->hasOne(Deal::class);
    }

    protected static function booted(): void
    {
        static::saving(function (self $rfq): void {
            $rfq->prepareLifecycleTimestamps();
            $rfq->ensureLifecycleTimestampsAreCoherent();
        });

        static::creating(function (self $rfq): void {
            $rfq->ensureBaselineIsConsistent();
        });

        static::updating(function (self $rfq): void {
            if ($rfq->isDirty(self::BASELINE_FIELDS)) {
                throw new LogicException('An RFQ calculation baseline is immutable.');
            }

            if ($rfq->getRawOriginal('status') !== RfqStatus::Draft->value
                && $rfq->isDirty(self::TECHNICAL_BRIEF_FIELDS)) {
                throw new LogicException('The technical brief of a non-draft RFQ is immutable.');
            }

            $rfq->ensureLifecycleTransitionIsValid();

            if ($rfq->getRawOriginal('published_at') !== null && $rfq->isDirty('published_at')) {
                throw new LogicException('An RFQ publication timestamp is immutable.');
            }

            if ($rfq->getRawOriginal('closed_at') !== null && $rfq->isDirty('closed_at')) {
                throw new LogicException('An RFQ closure timestamp is immutable.');
            }
        });
    }

    private function ensureBaselineIsConsistent(): void
    {
        $project = Project::query()->find($this->project_id);
        $snapshot = CalculationSnapshot::query()
            ->with('projectConfiguration:id,project_id')
            ->find($this->calculation_snapshot_id);

        if ($project === null
            || $snapshot === null
            || $snapshot->projectConfiguration === null
            || (int) $snapshot->projectConfiguration->project_id !== (int) $project->getKey()
            || (int) $project->customer_id !== (int) $this->customer_id) {
            throw new LogicException('The RFQ baseline must belong to its project and customer.');
        }

        $snapshot->ensureFinalized();
    }

    private function prepareLifecycleTimestamps(): void
    {
        $status = $this->currentStatus();

        if (in_array($status, [
            RfqStatus::Open,
            RfqStatus::Negotiating,
            RfqStatus::Awarded,
            RfqStatus::Closed,
        ], true) && $this->published_at === null) {
            $this->published_at = now();
        }

        if (in_array($status, [RfqStatus::Awarded, RfqStatus::Closed, RfqStatus::Cancelled], true)
            && $this->closed_at === null) {
            $this->closed_at = now();
        }
    }

    private function ensureLifecycleTransitionIsValid(): void
    {
        if (! $this->isDirty('status')) {
            return;
        }

        $originalStatus = RfqStatus::from((string) $this->getRawOriginal('status'));
        $currentStatus = $this->currentStatus();
        $allowedTransitions = match ($originalStatus) {
            RfqStatus::Draft => [RfqStatus::Open, RfqStatus::Cancelled],
            RfqStatus::Open => [RfqStatus::Negotiating, RfqStatus::Awarded, RfqStatus::Closed, RfqStatus::Cancelled],
            RfqStatus::Negotiating => [RfqStatus::Awarded, RfqStatus::Closed, RfqStatus::Cancelled],
            RfqStatus::Awarded => [RfqStatus::Closed],
            RfqStatus::Closed, RfqStatus::Cancelled => [],
        };

        if (! in_array($currentStatus, $allowedTransitions, true)) {
            throw new LogicException('The requested RFQ status transition is invalid.');
        }
    }

    private function ensureLifecycleTimestampsAreCoherent(): void
    {
        $status = $this->currentStatus();
        $requiresPublication = in_array($status, [
            RfqStatus::Open,
            RfqStatus::Negotiating,
            RfqStatus::Awarded,
            RfqStatus::Closed,
        ], true);
        $requiresClosure = in_array($status, [
            RfqStatus::Awarded,
            RfqStatus::Closed,
            RfqStatus::Cancelled,
        ], true);

        if ($requiresPublication && $this->published_at === null) {
            throw new LogicException('This RFQ status requires a publication timestamp.');
        }

        if ($requiresClosure && $this->closed_at === null) {
            throw new LogicException('This RFQ status requires a closure timestamp.');
        }

        if (! $requiresClosure && $this->closed_at !== null) {
            throw new LogicException('Only an awarded, closed, or cancelled RFQ may have a closure timestamp.');
        }
    }

    private function currentStatus(): RfqStatus
    {
        $status = $this->getAttribute('status');

        if ($status instanceof RfqStatus) {
            return $status;
        }

        if (is_string($status)) {
            return RfqStatus::from($status);
        }

        throw new LogicException('RFQ status is invalid.');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => RfqStatus::class,
            'requirements' => 'array',
            'published_at' => 'datetime',
            'due_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}
