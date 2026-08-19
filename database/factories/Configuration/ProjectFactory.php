<?php

namespace Database\Factories\Configuration;

use App\Configuration\ProjectStatus;
use App\Models\Configuration\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => User::factory()->customer(),
            'code' => Str::upper(fake()->unique()->bothify('PRJ-####-????')),
            'name' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'status' => ProjectStatus::Draft,
        ];
    }
}
