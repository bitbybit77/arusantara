<?php

namespace App\Models\Engineering;

use App\Configuration\ConfigurationStatus;
use App\Engineering\EngineeringResultStatus;
use App\Equipment\ElectricalPhase;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Procurement\Rfq;
use App\Models\User;
use BackedEnum;
use Database\Factories\Engineering\CalculationSnapshotFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LogicException;

#[Fillable([
    'project_configuration_id',
    'version',
    'calculator_version',
    'input_hash',
    'connected_load_w',
    'design_load_w',
    'design_current_a',
    'recommended_supply_v',
    'recommended_phase',
    'result_status',
    'input_payload',
    'result_payload',
    'assumptions',
    'warnings',
    'calculated_by_user_id',
    'calculated_at',
    'finalized_at',
])]
class CalculationSnapshot extends Model
{
    /** @use HasFactory<CalculationSnapshotFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<ProjectConfiguration, $this>
     */
    public function projectConfiguration(): BelongsTo
    {
        return $this->belongsTo(ProjectConfiguration::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function calculatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by_user_id');
    }

    /**
     * @return HasMany<CalculationLine, $this>
     */
    public function lines(): HasMany
    {
        return $this->hasMany(CalculationLine::class);
    }

    public function isFinalized(): bool
    {
        return $this->getAttribute('finalized_at') !== null;
    }

    public function ensureFinalized(): void
    {
        if (! $this->isFinalized()) {
            throw new LogicException('Only finalized calculation snapshots may be used for an RFQ.');
        }
    }

    public function finalize(): self
    {
        if ($this->isFinalized()) {
            return $this;
        }

        if (! $this->exists) {
            throw new LogicException('A calculation snapshot must be persisted before it can be finalized.');
        }

        $this->finalized_at = now();
        $this->save();

        return $this;
    }

    /**
     * @param  array<string|int, mixed>  $inputPayload
     * @return array<string|int, mixed>
     */
    public static function canonicalInputPayload(array $inputPayload): array
    {
        /** @var array<string|int, mixed> $canonical */
        $canonical = self::canonicalizeValue($inputPayload);

        return $canonical;
    }

    /**
     * @param  array<string|int, mixed>  $inputPayload
     */
    public static function inputHashFor(array $inputPayload): string
    {
        return hash('sha256', json_encode(
            self::canonicalInputPayload($inputPayload),
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE,
        ));
    }

    /**
     * @return HasMany<Rfq, $this>
     */
    public function rfqs(): HasMany
    {
        return $this->hasMany(Rfq::class);
    }

    protected static function booted(): void
    {
        static::creating(function (self $snapshot): void {
            $configurationIsLocked = ProjectConfiguration::query()
                ->whereKey($snapshot->project_configuration_id)
                ->where('status', ConfigurationStatus::Locked->value)
                ->exists();

            if (! $configurationIsLocked) {
                throw new LogicException('Calculation snapshots may only be created from locked project configurations.');
            }

            $inputPayload = $snapshot->getAttribute('input_payload');

            if (! is_array($inputPayload)) {
                throw new LogicException('Calculation snapshots require an input payload.');
            }

            $snapshot->input_payload = self::canonicalInputPayload($inputPayload);
            $snapshot->input_hash = self::inputHashFor($inputPayload);
        });

        static::updating(function (self $snapshot): void {
            if ($snapshot->getRawOriginal('finalized_at') === null
                && $snapshot->finalized_at !== null
                && count($snapshot->getDirty()) === 1
                && $snapshot->isDirty('finalized_at')) {
                return;
            }

            throw new LogicException('Calculation snapshots are immutable.');
        });

        static::deleting(function (): never {
            throw new LogicException('Calculation snapshots are immutable.');
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'connected_load_w' => 'decimal:3',
            'design_load_w' => 'decimal:3',
            'design_current_a' => 'decimal:3',
            'recommended_supply_v' => 'decimal:3',
            'recommended_phase' => ElectricalPhase::class,
            'result_status' => EngineeringResultStatus::class,
            'input_payload' => 'array',
            'result_payload' => 'array',
            'assumptions' => 'array',
            'warnings' => 'array',
            'calculated_at' => 'datetime',
            'finalized_at' => 'immutable_datetime',
        ];
    }

    private static function canonicalizeValue(mixed $value): mixed
    {
        if ($value instanceof BackedEnum) {
            return self::canonicalizeValue($value->value);
        }

        if ($value instanceof DateTimeInterface) {
            return $value->format(DateTimeInterface::ATOM);
        }

        if (is_array($value)) {
            $canonical = array_map(
                fn (mixed $item): mixed => self::canonicalizeValue($item),
                $value,
            );

            if (! array_is_list($canonical)) {
                ksort($canonical, SORT_STRING);
            }

            return $canonical;
        }

        if (is_float($value) && ! is_finite($value)) {
            throw new LogicException('Calculation snapshot input payloads cannot contain non-finite numbers.');
        }

        if (is_object($value) || is_resource($value)) {
            throw new LogicException('Calculation snapshot input payloads must contain JSON-compatible values.');
        }

        return $value;
    }
}
