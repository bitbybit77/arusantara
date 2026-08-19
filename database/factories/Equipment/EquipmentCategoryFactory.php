<?php

namespace Database\Factories\Equipment;

use App\Equipment\EquipmentCatalogStatus;
use App\Models\Equipment\EquipmentCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EquipmentCategory>
 */
class EquipmentCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'parent_id' => null,
            'code' => fake()->unique()->lexify('category-??????'),
            'name' => fake()->unique()->words(2, true),
            'description' => fake()->optional()->sentence(),
            'status' => EquipmentCatalogStatus::Active,
        ];
    }
}
