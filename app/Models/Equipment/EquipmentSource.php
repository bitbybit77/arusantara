<?php

namespace App\Models\Equipment;

use App\Models\User;
use App\VerificationStatus;
use Database\Factories\Equipment\EquipmentSourceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'equipment_model_id',
    'source_name',
    'source_url',
    'verification_status',
    'verified_at',
    'verified_by_user_id',
    'notes',
])]
class EquipmentSource extends Model
{
    /** @use HasFactory<EquipmentSourceFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'verification_status' => 'pending',
    ];

    /**
     * @return BelongsTo<EquipmentModel, $this>
     */
    public function equipmentModel(): BelongsTo
    {
        return $this->belongsTo(EquipmentModel::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verification_status' => VerificationStatus::class,
            'verified_at' => 'immutable_datetime',
        ];
    }
}
