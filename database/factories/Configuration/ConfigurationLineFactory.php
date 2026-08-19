<?php

namespace Database\Factories\Configuration;

use App\Configuration\EquipmentStatus;
use App\Configuration\SpecificationBasis;
use App\Equipment\SpecificationConfidence;
use App\Models\Configuration\ConfigurationLine;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Equipment\EquipmentCategory;
use App\Models\Equipment\EquipmentModel;
use BackedEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConfigurationLine>
 */
class ConfigurationLineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_configuration_id' => ProjectConfiguration::factory(),
            'equipment_category_id' => EquipmentCategory::factory(),
            'equipment_model_id' => null,
            'label' => fake()->words(3, true),
            'quantity' => fake()->numberBetween(1, 10),
            'equipment_status' => EquipmentStatus::Existing,
            'usage_profile' => [
                'hours_per_day' => fake()->numberBetween(1, 12),
                'simultaneous_use' => true,
            ],
            'customer_parameters' => [],
            'equipment_snapshot' => fn (array $attributes): array => [
                'equipment_category_id' => $attributes['equipment_category_id'],
                'equipment_model_id' => null,
                'category' => ['name' => 'Customer supplied equipment'],
                'technical' => [],
            ],
            'specification_basis' => SpecificationBasis::CategoryBased,
            'specification_confidence' => SpecificationConfidence::Unknown,
            'notes' => null,
            'sort_order' => 0,
        ];
    }

    public function planned(): static
    {
        return $this->state(fn (array $attributes): array => [
            'equipment_status' => EquipmentStatus::Planned,
        ]);
    }

    public function categoryBased(): static
    {
        return $this->state(fn (array $attributes): array => [
            'equipment_model_id' => null,
            'specification_basis' => SpecificationBasis::CategoryBased,
        ]);
    }

    public function estimated(): static
    {
        return $this->state(fn (array $attributes): array => [
            'equipment_model_id' => null,
            'specification_basis' => SpecificationBasis::Estimated,
        ]);
    }

    public function forEquipmentModel(EquipmentModel $equipmentModel): static
    {
        return $this->state(fn (array $attributes): array => [
            'equipment_category_id' => $equipmentModel->equipment_category_id,
            'equipment_model_id' => $equipmentModel->id,
            'label' => $equipmentModel->brand.' '.$equipmentModel->model,
            'equipment_snapshot' => [
                'equipment_model_id' => $equipmentModel->id,
                'equipment_category_id' => $equipmentModel->equipment_category_id,
                'brand' => $equipmentModel->brand,
                'model' => $equipmentModel->model,
                'equipment_type' => $equipmentModel->equipment_type,
                'rated_power_w' => $equipmentModel->rated_power_w,
                'voltage_v' => $equipmentModel->voltage_v,
                'phase' => $this->enumValue($equipmentModel->phase),
                'power_factor' => $equipmentModel->power_factor,
                'efficiency' => $equipmentModel->efficiency,
                'specification_confidence' => $this->enumValue($equipmentModel->specification_confidence),
                'captured_at' => now()->toIso8601String(),
            ],
            'specification_basis' => SpecificationBasis::Exact,
            'specification_confidence' => $equipmentModel->specification_confidence,
        ]);
    }

    private function enumValue(BackedEnum|string|null $value): ?string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }
}
