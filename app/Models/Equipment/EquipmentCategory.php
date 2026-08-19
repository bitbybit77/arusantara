<?php

namespace App\Models\Equipment;

use App\Equipment\EquipmentCatalogStatus;
use Database\Factories\Equipment\EquipmentCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['parent_id', 'code', 'name', 'description', 'status'])]
class EquipmentCategory extends Model
{
    /** @use HasFactory<EquipmentCategoryFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => 'active',
    ];

    /**
     * @return BelongsTo<EquipmentCategory, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * @return HasMany<EquipmentCategory, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * @return HasMany<EquipmentModel, $this>
     */
    public function equipmentModels(): HasMany
    {
        return $this->hasMany(EquipmentModel::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => EquipmentCatalogStatus::class,
        ];
    }
}
