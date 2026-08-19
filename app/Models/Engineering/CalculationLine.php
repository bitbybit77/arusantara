<?php

namespace App\Models\Engineering;

use App\Engineering\CalculationLineType;
use App\Engineering\EngineeringResultStatus;
use App\Equipment\ElectricalPhase;
use App\Models\Configuration\ConfigurationLine;
use App\Models\Procurement\Rfq;
use Database\Factories\Engineering\CalculationLineFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

#[Fillable([
    'calculation_snapshot_id',
    'source_configuration_line_id',
    'line_code',
    'line_type',
    'description',
    'quantity',
    'rated_power_w',
    'design_power_w',
    'design_current_a',
    'phase',
    'circuit_group',
    'recommended_protection',
    'recommended_rating_a',
    'result_status',
    'education_reference',
    'calculation_detail',
    'sort_order',
])]
class CalculationLine extends Model
{
    /** @use HasFactory<CalculationLineFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'sort_order' => 0,
    ];

    /**
     * @return BelongsTo<CalculationSnapshot, $this>
     */
    public function calculationSnapshot(): BelongsTo
    {
        return $this->belongsTo(CalculationSnapshot::class);
    }

    /**
     * @return BelongsTo<ConfigurationLine, $this>
     */
    public function sourceConfigurationLine(): BelongsTo
    {
        return $this->belongsTo(ConfigurationLine::class, 'source_configuration_line_id');
    }

    protected static function booted(): void
    {
        static::creating(function (self $line): void {
            $line->ensureSnapshotAcceptsNewLines();
            $line->ensureSourceBelongsToSnapshotConfiguration();
        });

        static::updating(function (): never {
            throw new LogicException('Calculation lines are immutable.');
        });

        static::deleting(function (): never {
            throw new LogicException('Calculation lines are immutable.');
        });
    }

    private function ensureSnapshotAcceptsNewLines(): void
    {
        $snapshot = CalculationSnapshot::query()
            ->whereKey($this->calculation_snapshot_id)
            ->lockForUpdate()
            ->first();

        if ($snapshot === null) {
            throw new LogicException('The calculation snapshot does not exist.');
        }

        $snapshotIsReferencedByRfq = Rfq::query()
            ->where('calculation_snapshot_id', $this->calculation_snapshot_id)
            ->exists();

        if ($snapshotIsReferencedByRfq) {
            throw new LogicException('Calculation lines cannot be added after the snapshot is referenced by an RFQ.');
        }

        if ($snapshot->isFinalized()) {
            throw new LogicException('Calculation lines cannot be added after the snapshot is finalized.');
        }
    }

    private function ensureSourceBelongsToSnapshotConfiguration(): void
    {
        if ($this->source_configuration_line_id === null) {
            return;
        }

        $snapshotConfigurationId = CalculationSnapshot::query()
            ->whereKey($this->calculation_snapshot_id)
            ->value('project_configuration_id');

        $sourceConfigurationId = ConfigurationLine::query()
            ->whereKey($this->source_configuration_line_id)
            ->value('project_configuration_id');

        if ($sourceConfigurationId === null
            || (int) $sourceConfigurationId !== (int) $snapshotConfigurationId) {
            throw new LogicException('The source configuration line does not belong to the calculation snapshot configuration.');
        }
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'line_type' => CalculationLineType::class,
            'quantity' => 'decimal:3',
            'rated_power_w' => 'decimal:3',
            'design_power_w' => 'decimal:3',
            'design_current_a' => 'decimal:3',
            'phase' => ElectricalPhase::class,
            'recommended_rating_a' => 'decimal:3',
            'result_status' => EngineeringResultStatus::class,
            'calculation_detail' => 'array',
        ];
    }
}
