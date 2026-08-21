<?php

namespace App\Models\Configuration;

use App\Configuration\ConfigurationStatus;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\User;
use Database\Factories\Configuration\ProjectConfigurationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LogicException;

#[Fillable(['project_id', 'version', 'status', 'created_by_user_id', 'locked_at'])]
class ProjectConfiguration extends Model
{
    /** @use HasFactory<ProjectConfigurationFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => ConfigurationStatus::Draft->value,
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

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * @return HasMany<ConfigurationLine, $this>
     */
    public function lines(): HasMany
    {
        return $this->hasMany(ConfigurationLine::class);
    }

    /**
     * @return HasMany<CalculationSnapshot, $this>
     */
    public function calculationSnapshots(): HasMany
    {
        return $this->hasMany(CalculationSnapshot::class);
    }

    public function isReadOnly(): bool
    {
        return in_array($this->currentStatus(), [ConfigurationStatus::Locked, ConfigurationStatus::Superseded], true);
    }

    protected static function booted(): void
    {
        static::saving(function (self $configuration): void {
            if ($configuration->currentStatus() === ConfigurationStatus::Locked && $configuration->locked_at === null) {
                $configuration->setAttribute('locked_at', now());
            }

            if (in_array($configuration->currentStatus(), [
                ConfigurationStatus::Draft,
                ConfigurationStatus::Ready,
            ], true) && $configuration->locked_at !== null) {
                throw new LogicException('Only a locked or superseded configuration may have a lock timestamp.');
            }
        });

        static::updating(function (self $configuration): void {
            $originalStatus = $configuration->persistedStatus();

            if ($configuration->isDirty(['project_id', 'version', 'created_by_user_id'])) {
                throw new LogicException('A project configuration version and ownership are immutable.');
            }

            if ($configuration->isDirty('status')) {
                $allowedTransitions = match ($originalStatus) {
                    ConfigurationStatus::Draft => [ConfigurationStatus::Ready, ConfigurationStatus::Locked],
                    ConfigurationStatus::Ready => [ConfigurationStatus::Draft, ConfigurationStatus::Locked],
                    ConfigurationStatus::Locked => [ConfigurationStatus::Superseded],
                    ConfigurationStatus::Superseded => [],
                };

                if (! in_array($configuration->currentStatus(), $allowedTransitions, true)) {
                    throw new LogicException('The requested project configuration status transition is invalid.');
                }
            }

            if ($originalStatus === ConfigurationStatus::Locked
                && $configuration->currentStatus() === ConfigurationStatus::Superseded
                && array_keys($configuration->getDirty()) === ['status']) {
                return;
            }

            if (in_array($originalStatus, [ConfigurationStatus::Locked, ConfigurationStatus::Superseded], true)) {
                throw new LogicException('Locked or superseded project configurations are immutable.');
            }
        });

        static::deleting(function (self $configuration): void {
            if (in_array($configuration->persistedStatus(), [
                ConfigurationStatus::Locked,
                ConfigurationStatus::Superseded,
            ], true)) {
                throw new LogicException('Locked or superseded project configurations cannot be deleted.');
            }
        });
    }

    private function currentStatus(): ConfigurationStatus
    {
        $status = $this->getAttribute('status');

        if ($status instanceof ConfigurationStatus) {
            return $status;
        }

        if (is_string($status)) {
            return ConfigurationStatus::from($status);
        }

        throw new LogicException('Project configuration status is invalid.');
    }

    private function persistedStatus(): ConfigurationStatus
    {
        $persistedConfiguration = self::query()
            ->whereKey($this->getKey())
            ->lockForUpdate()
            ->firstOrFail();

        return $persistedConfiguration->currentStatus();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ConfigurationStatus::class,
            'locked_at' => 'datetime',
        ];
    }
}
