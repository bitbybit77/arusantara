<?php

namespace Database\Factories\Procurement;

use App\Models\Procurement\QuotationItem;
use App\Models\Procurement\QuotationRevision;
use App\Procurement\QuotationItemType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuotationItem>
 */
class QuotationItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quotation_revision_id' => QuotationRevision::factory(),
            'type' => QuotationItemType::Component,
            'description' => fake()->randomElement(['MCCB', 'MCB', 'Panel enclosure', 'Busbar']),
            'manufacturer' => fake()->company(),
            'part_number' => fake()->bothify('PART-####'),
            'quantity' => '1.000',
            'unit' => 'unit',
            'unit_price' => '1000000.00',
            'line_total' => '1000000.00',
            'specification' => ['rating' => 'as specified'],
            'sort_order' => 0,
        ];
    }
}
