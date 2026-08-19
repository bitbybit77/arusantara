<?php

namespace Database\Factories\Messaging;

use App\Models\Identity\MakerProfile;
use App\Models\Messaging\Conversation;
use App\Models\Messaging\Message;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'sender_user_id' => fn (array $attributes): int => (int) Conversation::query()
                ->whereKey($attributes['conversation_id'])
                ->value('customer_id'),
            'message' => fake()->paragraph(),
            'attachment_path' => null,
            'read_at' => null,
        ];
    }

    public function fromMaker(): static
    {
        return $this->state(fn (): array => [
            'sender_user_id' => function (array $attributes): int {
                $makerProfileId = Conversation::query()
                    ->whereKey($attributes['conversation_id'])
                    ->value('maker_profile_id');

                return (int) MakerProfile::query()
                    ->whereKey($makerProfileId)
                    ->value('user_id');
            },
        ]);
    }

    public function read(): static
    {
        return $this->state(fn (): array => ['read_at' => now()]);
    }
}
