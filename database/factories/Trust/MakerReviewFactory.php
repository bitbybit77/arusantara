<?php

namespace Database\Factories\Trust;

use App\Models\Procurement\Deal;
use App\Models\Trust\MakerReview;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MakerReview>
 */
class MakerReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'deal_id' => Deal::factory()->completed(),
            'customer_id' => fn (array $attributes): int => (int) Deal::query()
                ->whereKey($attributes['deal_id'])
                ->value('customer_id'),
            'maker_profile_id' => fn (array $attributes): int => (int) Deal::query()
                ->whereKey($attributes['deal_id'])
                ->value('maker_profile_id'),
            'overall_rating' => fake()->numberBetween(1, 5),
            'quality_rating' => fake()->numberBetween(1, 5),
            'specification_compliance_rating' => fake()->numberBetween(1, 5),
            'communication_rating' => fake()->numberBetween(1, 5),
            'delivery_rating' => fake()->numberBetween(1, 5),
            'comment' => fake()->optional()->paragraph(),
        ];
    }
}
