<?php

namespace Database\Factories\Identity;

use App\Identity\MakerProfileStatus;
use App\Models\Identity\MakerProfile;
use App\Models\User;
use App\VerificationStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MakerProfile>
 */
class MakerProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->maker(),
            'business_name' => fake()->company(),
            'description' => fake()->optional()->paragraph(),
            'phone' => fake()->optional()->phoneNumber(),
            'city' => fake()->city(),
            'service_area' => [fake()->city()],
            'verification_status' => VerificationStatus::Pending,
            'verified_at' => null,
            'status' => MakerProfileStatus::Active,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => VerificationStatus::Verified,
            'verified_at' => now(),
        ]);
    }
}
