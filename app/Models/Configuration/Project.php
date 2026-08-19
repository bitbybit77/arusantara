<?php

namespace App\Models\Configuration;

use App\Configuration\ProjectStatus;
use App\Models\Procurement\Rfq;
use App\Models\User;
use Database\Factories\Configuration\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LogicException;

#[Fillable(['customer_id', 'code', 'name', 'description', 'status'])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => ProjectStatus::Draft->value,
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * @return HasMany<ProjectConfiguration, $this>
     */
    public function configurations(): HasMany
    {
        return $this->hasMany(ProjectConfiguration::class);
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
        static::creating(function (self $project): void {
            $project->ensureOwnerIsCustomer();
        });

        static::updating(function (self $project): void {
            if ($project->isDirty('customer_id')) {
                throw new LogicException('A project customer cannot be reassigned.');
            }

            $project->ensureOwnerIsCustomer();
        });
    }

    private function ensureOwnerIsCustomer(): void
    {
        $owner = User::query()->find($this->getAttribute('customer_id'));

        if (! $owner?->isCustomer()) {
            throw new LogicException('A project must belong to a customer user.');
        }
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
        ];
    }
}
