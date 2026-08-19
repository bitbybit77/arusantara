<?php

namespace Database\Factories\Configuration;

use App\Configuration\ConfigurationStatus;
use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectConfiguration>
 */
class ProjectConfigurationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'version' => 1,
            'status' => ConfigurationStatus::Draft,
            'created_by_user_id' => User::factory(),
            'locked_at' => null,
        ];
    }

    public function ready(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ConfigurationStatus::Ready,
            'locked_at' => null,
        ]);
    }

    public function locked(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ConfigurationStatus::Locked,
            'locked_at' => now(),
        ]);
    }
}
