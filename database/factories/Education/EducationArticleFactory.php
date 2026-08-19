<?php

namespace Database\Factories\Education;

use App\Education\EducationArticleStatus;
use App\Models\Education\EducationArticle;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EducationArticle>
 */
class EducationArticleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(5);

        return [
            'author_user_id' => User::factory(),
            'title' => $title,
            'slug' => str($title)->slug(),
            'category' => fake()->randomElement(['electrical-basics', 'safety', 'equipment']),
            'summary' => fake()->paragraph(),
            'content' => fake()->paragraphs(5, true),
            'status' => EducationArticleStatus::Draft,
            'published_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => [
            'status' => EducationArticleStatus::Published,
            'published_at' => now(),
        ]);
    }
}
