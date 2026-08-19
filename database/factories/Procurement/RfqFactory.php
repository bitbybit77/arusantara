<?php

namespace Database\Factories\Procurement;

use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Procurement\Rfq;
use App\Procurement\RfqStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Rfq>
 */
class RfqFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'calculation_snapshot_id' => CalculationSnapshot::factory(),
            'project_id' => function (array $attributes): int {
                $configurationId = CalculationSnapshot::query()
                    ->whereKey($attributes['calculation_snapshot_id'])
                    ->value('project_configuration_id');

                return (int) ProjectConfiguration::query()
                    ->whereKey($configurationId)
                    ->value('project_id');
            },
            'customer_id' => fn (array $attributes): int => (int) Project::query()
                ->whereKey($attributes['project_id'])
                ->value('customer_id'),
            'number' => Str::upper(fake()->unique()->bothify('RFQ-####-????')),
            'title' => fake()->sentence(5),
            'status' => RfqStatus::Draft,
            'requirements' => ['scope' => 'preliminary_panel_configuration'],
            'installation_location' => fake()->optional()->city(),
            'published_at' => null,
            'due_at' => now()->addDays(14),
            'closed_at' => null,
        ];
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => RfqStatus::Open,
            'published_at' => now(),
        ]);
    }
}
