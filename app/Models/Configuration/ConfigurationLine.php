<?php

namespace App\Models\Configuration;

use App\Configuration\ConfigurationStatus;
use App\Configuration\EquipmentStatus;
use App\Configuration\SpecificationBasis;
use App\Equipment\SpecificationConfidence;
use App\Models\Engineering\CalculationLine;
use App\Models\Equipment\EquipmentCategory;
use App\Models\Equipment\EquipmentModel;
use BackedEnum;
use Database\Factories\Configuration\ConfigurationLineFactory;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LogicException;

#[Fillable([
    'project_configuration_id',
    'equipment_category_id',
    'equipment_model_id',
    'label',
    'quantity',
    'equipment_status',
    'usage_profile',
    'customer_parameters',
    'equipment_snapshot',
    'specification_basis',
    'specification_confidence',
    'notes',
    'sort_order',
])]
class ConfigurationLine extends Model
{
    /** @use HasFactory<ConfigurationLineFactory> */
    use HasFactory;

    /**
     * @param  array<string, mixed>  $options
     */
    public function save(array $options = []): bool
    {
        $requiresCanonicalCapture = $this->equipment_model_id !== null
            && (! $this->exists || $this->isDirty([
                'equipment_category_id',
                'equipment_model_id',
                'equipment_snapshot',
                'specification_basis',
                'specification_confidence',
            ]));

        if (! $requiresCanonicalCapture || $this->getConnection()->transactionLevel() > 0) {
            return parent::save($options);
        }

        return (bool) $this->getConnection()->transaction(
            fn (): bool => parent::save($options),
            3,
        );
    }

    /** @var array<string, mixed> */
    protected $attributes = [
        'equipment_status' => EquipmentStatus::Existing->value,
        'specification_basis' => SpecificationBasis::Estimated->value,
        'specification_confidence' => SpecificationConfidence::Unknown->value,
        'sort_order' => 0,
    ];

    /**
     * @return BelongsTo<ProjectConfiguration, $this>
     */
    public function projectConfiguration(): BelongsTo
    {
        return $this->belongsTo(ProjectConfiguration::class);
    }

    /**
     * @return BelongsTo<EquipmentCategory, $this>
     */
    public function equipmentCategory(): BelongsTo
    {
        return $this->belongsTo(EquipmentCategory::class);
    }

    /**
     * @return BelongsTo<EquipmentModel, $this>
     */
    public function equipmentModel(): BelongsTo
    {
        return $this->belongsTo(EquipmentModel::class);
    }

    /**
     * @return HasMany<CalculationLine, $this>
     */
    public function calculationLines(): HasMany
    {
        return $this->hasMany(CalculationLine::class, 'source_configuration_line_id');
    }

    protected static function booted(): void
    {
        static::creating(function (self $line): void {
            $line->ensureConfigurationsAreMutable();
            $line->ensureEquipmentModelBelongsToCategory();
            $line->captureCanonicalEquipmentSnapshot();
            $line->ensureSpecificationBasisIsCoherent();
            $line->ensureEquipmentSnapshotIsCoherent();
        });

        static::updating(function (self $line): void {
            $line->ensureConfigurationsAreMutable();
            $line->ensureEquipmentModelBelongsToCategory();

            if ($line->shouldRecaptureExactSpecification()) {
                $line->captureCanonicalEquipmentSnapshot();
            }

            $line->ensureSpecificationBasisIsCoherent();
            $line->ensureEquipmentSnapshotIsCoherent();
        });

        static::deleting(fn (self $line) => $line->ensureConfigurationsAreMutable());
    }

    private function ensureEquipmentModelBelongsToCategory(): void
    {
        if ($this->equipment_model_id === null) {
            return;
        }

        $modelBelongsToCategory = EquipmentModel::query()
            ->whereKey($this->equipment_model_id)
            ->where('equipment_category_id', $this->equipment_category_id)
            ->exists();

        if (! $modelBelongsToCategory) {
            throw new LogicException('The selected equipment model does not belong to the configuration line category.');
        }
    }

    private function ensureEquipmentSnapshotIsCoherent(): void
    {
        $snapshot = $this->getAttribute('equipment_snapshot');

        if (! is_array($snapshot) || $snapshot === []) {
            throw new LogicException('A non-empty equipment snapshot is required.');
        }

        if (! $this->snapshotIdMatches($snapshot['equipment_category_id'] ?? null, $this->equipment_category_id)) {
            throw new LogicException('The equipment snapshot category does not match the configuration line category.');
        }

        if ($this->equipment_model_id === null) {
            if (($snapshot['equipment_model_id'] ?? null) !== null) {
                throw new LogicException('A category-only configuration line cannot snapshot an equipment model.');
            }

            return;
        }

        if (! $this->snapshotIdMatches($snapshot['equipment_model_id'] ?? null, $this->equipment_model_id)) {
            throw new LogicException('The equipment snapshot model does not match the selected equipment model.');
        }
    }

    private function captureCanonicalEquipmentSnapshot(): void
    {
        if ($this->equipment_model_id === null) {
            return;
        }

        $equipmentModel = EquipmentModel::query()
            ->whereKey($this->equipment_model_id)
            ->where('equipment_category_id', $this->equipment_category_id)
            ->lockForUpdate()
            ->first();

        if ($equipmentModel === null) {
            throw new LogicException('The selected equipment model does not belong to the configuration line category.');
        }

        $equipmentCategory = EquipmentCategory::query()
            ->whereKey($equipmentModel->equipment_category_id)
            ->lockForUpdate()
            ->firstOrFail();

        $sources = $equipmentModel->sources()
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        $capturedAt = now()->toIso8601String();

        $this->setAttribute('equipment_snapshot', [
            'schema_version' => 1,
            'equipment_category_id' => (int) $equipmentCategory->getKey(),
            'equipment_model_id' => (int) $equipmentModel->getKey(),
            'category' => [
                'id' => (int) $equipmentCategory->getKey(),
                'parent_id' => $equipmentCategory->parent_id === null
                    ? null
                    : (int) $equipmentCategory->parent_id,
                'code' => $equipmentCategory->code,
                'name' => $equipmentCategory->name,
                'description' => $equipmentCategory->description,
                'status' => $this->enumValue($equipmentCategory->status),
            ],
            'brand' => $equipmentModel->brand,
            'model' => $equipmentModel->model,
            'equipment_type' => $equipmentModel->equipment_type,
            'specification_variant' => $equipmentModel->specification_variant,
            'rated_power_w' => $equipmentModel->rated_power_w,
            'voltage_v' => $equipmentModel->voltage_v,
            'frequency_hz' => $equipmentModel->frequency_hz,
            'rated_current_a' => $equipmentModel->rated_current_a,
            'phase' => $this->enumValue($equipmentModel->phase),
            'power_factor' => $equipmentModel->power_factor,
            'efficiency' => $equipmentModel->efficiency,
            'technical' => [
                'rated_power_w' => $equipmentModel->rated_power_w,
                'voltage_v' => $equipmentModel->voltage_v,
                'frequency_hz' => $equipmentModel->frequency_hz,
                'rated_current_a' => $equipmentModel->rated_current_a,
                'phase' => $this->enumValue($equipmentModel->phase),
                'power_factor' => $equipmentModel->power_factor,
                'efficiency' => $equipmentModel->efficiency,
            ],
            'specification_confidence' => $this->enumValue($equipmentModel->specification_confidence),
            'catalog_status' => $this->enumValue($equipmentModel->status),
            'provenance' => [
                'captured_at' => $capturedAt,
                'equipment_category_updated_at' => $this->dateTimeValue($equipmentCategory->updated_at),
                'equipment_model_updated_at' => $this->dateTimeValue($equipmentModel->updated_at),
                'sources' => $sources->map(fn ($source): array => [
                    'id' => (int) $source->getKey(),
                    'source_name' => $source->source_name,
                    'source_url' => $source->source_url,
                    'verification_status' => $this->enumValue($source->verification_status),
                    'verified_at' => $this->dateTimeValue($source->verified_at),
                    'verified_by_user_id' => $source->verified_by_user_id === null
                        ? null
                        : (int) $source->verified_by_user_id,
                    'notes' => $source->notes,
                ])->all(),
            ],
            'captured_at' => $capturedAt,
        ]);
        $this->setAttribute('specification_basis', SpecificationBasis::Exact);
        $this->setAttribute('specification_confidence', $equipmentModel->specification_confidence);
    }

    private function shouldRecaptureExactSpecification(): bool
    {
        return $this->equipment_model_id !== null
            && $this->isDirty([
                'equipment_category_id',
                'equipment_model_id',
                'equipment_snapshot',
                'specification_basis',
                'specification_confidence',
            ]);
    }

    private function ensureSpecificationBasisIsCoherent(): void
    {
        $basis = $this->specificationBasis();

        if ($this->equipment_model_id === null && $basis === SpecificationBasis::Exact) {
            throw new LogicException('An exact specification basis requires a selected equipment model.');
        }

        if ($this->equipment_model_id !== null
            && $basis !== SpecificationBasis::Exact
            && (! $this->exists || $this->shouldRecaptureExactSpecification())) {
            throw new LogicException('A selected equipment model must use an exact specification basis.');
        }
    }

    private function specificationBasis(): SpecificationBasis
    {
        $basis = $this->getAttribute('specification_basis');

        if ($basis instanceof SpecificationBasis) {
            return $basis;
        }

        if (is_string($basis)) {
            return SpecificationBasis::from($basis);
        }

        throw new LogicException('The specification basis is invalid.');
    }

    private function enumValue(BackedEnum|string|null $value): ?string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }

    private function dateTimeValue(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format(DateTimeInterface::ATOM);
        }

        return is_string($value) ? $value : null;
    }

    private function snapshotIdMatches(mixed $snapshotId, mixed $modelId): bool
    {
        if ((! is_int($snapshotId) && ! is_string($snapshotId))
            || (! is_int($modelId) && ! is_string($modelId))) {
            return false;
        }

        return (string) $snapshotId === (string) $modelId;
    }

    private function ensureConfigurationsAreMutable(): void
    {
        $configurationIds = array_values(array_unique(array_filter([
            $this->project_configuration_id,
            $this->getRawOriginal('project_configuration_id'),
        ])));

        $hasReadOnlyConfiguration = ProjectConfiguration::query()
            ->whereKey($configurationIds)
            ->whereIn('status', [ConfigurationStatus::Locked->value, ConfigurationStatus::Superseded->value])
            ->exists();

        if ($hasReadOnlyConfiguration) {
            throw new LogicException('Lines on locked or superseded project configurations are immutable.');
        }
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'equipment_status' => EquipmentStatus::class,
            'usage_profile' => 'array',
            'customer_parameters' => 'array',
            'equipment_snapshot' => 'array',
            'specification_basis' => SpecificationBasis::class,
            'specification_confidence' => SpecificationConfidence::class,
        ];
    }
}
