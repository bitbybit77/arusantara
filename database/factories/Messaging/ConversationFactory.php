<?php

namespace Database\Factories\Messaging;

use App\Messaging\ConversationStatus;
use App\Models\Identity\MakerProfile;
use App\Models\Messaging\Conversation;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\Rfq;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rfq_id' => Rfq::factory(),
            'quotation_id' => null,
            'customer_id' => fn (array $attributes): int => (int) Rfq::query()
                ->whereKey($attributes['rfq_id'])
                ->value('customer_id'),
            'maker_profile_id' => MakerProfile::factory(),
            'status' => ConversationStatus::Active,
            'closed_at' => null,
        ];
    }

    public function forQuotation(Quotation $quotation): static
    {
        return $this->state(fn (): array => [
            'rfq_id' => $quotation->rfq_id,
            'quotation_id' => $quotation->getKey(),
            'customer_id' => $quotation->rfq()->value('customer_id'),
            'maker_profile_id' => $quotation->maker_profile_id,
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (): array => [
            'status' => ConversationStatus::Closed,
            'closed_at' => now(),
        ]);
    }
}
