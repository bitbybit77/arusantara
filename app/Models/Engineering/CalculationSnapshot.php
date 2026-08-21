<?php

namespace App\Models\Engineering;

use App\Configuration\ConfigurationStatus;
use App\Engineering\EngineeringResultStatus;
use App\Equipment\ElectricalPhase;
use App\Models\Configuration\ConfigurationLine;
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
     * @param  array<string, mixed>  $options
     */
    public function save(array $options = []): bool
    {
        if ($this->exists || $this->getConnection()->transactionLevel() > 0) {
            return parent::save($options);
        }

        return (bool) $this->getConnection()->transaction(
            fn (): bool => parent::save($options),
            3,
        );
    }

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

        $this->setAttribute('finalized_at', now());
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
     * Capture the authoritative inputs for a locked project configuration.
     *
     * @return array<string, mixed>
     */
    public static function captureInputPayload(ProjectConfiguration|int $projectConfiguration): array
    {
        $configurationId = $projectConfiguration instanceof ProjectConfiguration
            ? $projectConfiguration->getKey()
            : $projectConfiguration;

        if (! is_int($configurationId) && ! is_string($configurationId)) {
            throw new LogicException('A persisted project configuration is required to capture calculation inputs.');
        }

        $connection = (new ProjectConfiguration)->getConnection();
        $capture = static function () use ($configurationId): array {
            $lockedConfiguration = ProjectConfiguration::query()
                ->whereKey($configurationId)
                ->lockForUpdate()
                ->firstOrFail();

            if ((string) $lockedConfiguration->getRawOriginal('status') !== ConfigurationStatus::Locked->value) {
                throw new LogicException('Calculation snapshots may only be created from locked project configurations.');
            }

            $configurationLines = ConfigurationLine::query()
                ->where('project_configuration_id', $lockedConfiguration->getKey())
                ->orderBy('sort_order')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            return [
                'schema_version' => 1,
                'project_configuration' => [
                    'id' => (int) $lockedConfiguration->getKey(),
                    'project_id' => (int) $lockedConfiguration->project_id,
                    'version' => (int) $lockedConfiguration->version,
                    'status' => self::enumValue($lockedConfiguration->status),
                    'locked_at' => self::dateTimeValue($lockedConfiguration->locked_at),
                ],
                'configuration_lines' => $configurationLines
                    ->map(static fn (ConfigurationLine $line): array => [
                        'id' => (int) $line->getKey(),
                        'equipment_category_id' => (int) $line->equipment_category_id,
                        'equipment_model_id' => $line->equipment_model_id === null
                            ? null
                            : (int) $line->equipment_model_id,
                        'label' => $line->label,
                        'quantity' => (int) $line->quantity,
                        'equipment_status' => self::enumValue($line->equipment_status),
                        'usage_profile' => $line->usage_profile,
                        'customer_parameters' => $line->customer_parameters,
                        'equipment_snapshot' => $line->equipment_snapshot,
                        'specification_basis' => self::enumValue($line->specification_basis),
                        'specification_confidence' => self::enumValue($line->specification_confidence),
                        'notes' => $line->notes,
                        'sort_order' => (int) $line->sort_order,
                    ])
                    ->values()
                    ->all(),
            ];
        };

        if ($connection->transactionLevel() > 0) {
            return $capture();
        }

        return $connection->transaction($capture, 3);
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
            $inputPayload = self::captureInputPayload((int) $snapshot->project_configuration_id);

            $snapshot->setAttribute('input_payload', self::canonicalInputPayload($inputPayload));
            $snapshot->setAttribute('input_hash', self::inputHashFor($inputPayload));
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

    private static function enumValue(BackedEnum|string|null $value): ?string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }

    private static function dateTimeValue(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format(DateTimeInterface::ATOM);
        }

        return is_string($value) ? $value : null;
    }
}
