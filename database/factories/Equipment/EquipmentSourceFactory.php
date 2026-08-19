<?php

namespace Database\Factories\Equipment;

use App\Models\Equipment\EquipmentModel;
use App\Models\Equipment\EquipmentSource;
use App\Models\User;
use App\VerificationStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EquipmentSource>
 */
class EquipmentSourceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'equipment_model_id' => EquipmentModel::factory(),
            'source_name' => fake()->company().' technical data',
            'source_url' => fake()->optional()->url(),
            'verification_status' => VerificationStatus::Pending,
            'verified_at' => null,
            'verified_by_user_id' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => VerificationStatus::Verified,
            'verified_at' => now(),
            'verified_by_user_id' => User::factory()->admin(),
        ]);
    }
}
