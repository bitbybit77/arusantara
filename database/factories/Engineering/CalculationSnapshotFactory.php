<?php

namespace Database\Factories\Engineering;

use App\Engineering\EngineeringResultStatus;
use App\Equipment\ElectricalPhase;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CalculationSnapshot>
 */
class CalculationSnapshotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $calculatedAt = now();
        $inputPayload = ['loads' => []];

        return [
            'project_configuration_id' => ProjectConfiguration::factory()->locked(),
            'version' => 1,
            'calculator_version' => 'preliminary-v1',
            'input_hash' => CalculationSnapshot::inputHashFor($inputPayload),
            'connected_load_w' => 12000,
            'design_load_w' => 9600,
            'design_current_a' => 25.200,
            'recommended_supply_v' => 380,
            'recommended_phase' => ElectricalPhase::ThreePhase,
            'result_status' => EngineeringResultStatus::Calculated,
            'input_payload' => $inputPayload,
            'result_payload' => ['recommendation' => 'preliminary_panel_configuration'],
            'assumptions' => [],
            'warnings' => [],
            'calculated_by_user_id' => User::factory(),
            'calculated_at' => $calculatedAt,
            'finalized_at' => $calculatedAt,
        ];
    }

    public function unfinalized(): static
    {
        return $this->state(fn (array $attributes): array => [
            'finalized_at' => null,
        ]);
    }

    public function requiresVerification(): static
    {
        return $this->state(fn (array $attributes): array => [
            'result_status' => EngineeringResultStatus::RequiresVerification,
            'warnings' => ['Equipment specifications require engineering verification.'],
        ]);
    }
}
