<?php

namespace Database\Factories\Engineering;

use App\Engineering\CalculationLineType;
use App\Engineering\EngineeringResultStatus;
use App\Equipment\ElectricalPhase;
use App\Models\Configuration\ConfigurationLine;
use App\Models\Engineering\CalculationLine;
use App\Models\Engineering\CalculationSnapshot;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CalculationLine>
 */
class CalculationLineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'calculation_snapshot_id' => CalculationSnapshot::factory()->unfinalized(),
            'source_configuration_line_id' => null,
            'line_code' => Str::upper(fake()->unique()->bothify('LOAD-####-??')),
            'line_type' => CalculationLineType::Load,
            'description' => fake()->sentence(4),
            'quantity' => 1,
            'rated_power_w' => 3000,
            'design_power_w' => 3000,
            'design_current_a' => 13.636,
            'phase' => ElectricalPhase::SinglePhase,
            'circuit_group' => null,
            'recommended_protection' => null,
            'recommended_rating_a' => null,
            'result_status' => EngineeringResultStatus::Calculated,
            'education_reference' => null,
            'calculation_detail' => [],
            'sort_order' => 0,
        ];
    }

    public function forConfigurationLine(ConfigurationLine $configurationLine): static
    {
        return $this->state(function (array $attributes) use ($configurationLine): array {
            $state = [
                'source_configuration_line_id' => $configurationLine->id,
            ];

            if ($attributes['calculation_snapshot_id'] instanceof Factory) {
                $state['calculation_snapshot_id'] = CalculationSnapshot::factory()
                    ->unfinalized()
                    ->for($configurationLine->projectConfiguration, 'projectConfiguration');
            }

            return $state;
        });
    }
}
