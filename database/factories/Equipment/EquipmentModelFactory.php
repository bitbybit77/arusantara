<?php

namespace Database\Factories\Equipment;

use App\Equipment\ElectricalPhase;
use App\Equipment\EquipmentCatalogStatus;
use App\Equipment\SpecificationConfidence;
use App\Models\Equipment\EquipmentCategory;
use App\Models\Equipment\EquipmentModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EquipmentModel>
 */
class EquipmentModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'equipment_category_id' => EquipmentCategory::factory(),
            'brand' => fake()->company(),
            'model' => fake()->unique()->bothify('??-####'),
            'equipment_type' => fake()->optional()->word(),
            'rated_power_w' => fake()->randomFloat(3, 100, 15_000),
            'voltage_v' => fake()->randomElement([220, 230, 380, 400]),
            'phase' => fake()->randomElement(ElectricalPhase::cases()),
            'power_factor' => fake()->randomFloat(4, 0.7, 1),
            'efficiency' => fake()->randomFloat(4, 0.7, 1),
            'specification_confidence' => SpecificationConfidence::Unknown,
            'status' => EquipmentCatalogStatus::Active,
        ];
    }
}
