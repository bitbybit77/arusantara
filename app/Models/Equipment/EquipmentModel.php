<?php

namespace App\Models\Equipment;

use App\Equipment\ElectricalPhase;
use App\Equipment\EquipmentCatalogStatus;
use App\Equipment\SpecificationConfidence;
use Database\Factories\Equipment\EquipmentModelFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'equipment_category_id',
    'brand',
    'model',
    'equipment_type',
    'rated_power_w',
    'voltage_v',
    'phase',
    'power_factor',
    'efficiency',
    'specification_confidence',
    'status',
])]
class EquipmentModel extends Model
{
    /** @use HasFactory<EquipmentModelFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'specification_confidence' => 'unknown',
        'status' => 'active',
    ];

    /**
     * @return BelongsTo<EquipmentCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(EquipmentCategory::class, 'equipment_category_id');
    }

    /**
     * @return HasMany<EquipmentSource, $this>
     */
    public function sources(): HasMany
    {
        return $this->hasMany(EquipmentSource::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rated_power_w' => 'decimal:3',
            'voltage_v' => 'decimal:2',
            'phase' => ElectricalPhase::class,
            'power_factor' => 'decimal:4',
            'efficiency' => 'decimal:4',
            'specification_confidence' => SpecificationConfidence::class,
            'status' => EquipmentCatalogStatus::class,
        ];
    }
}
