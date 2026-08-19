<?php

namespace Database\Factories\Procurement;

use App\Actions\Procurement\SubmitQuotationRevision;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuotationRevision>
 */
class QuotationRevisionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quotation_id' => Quotation::factory(),
            'revision_number' => 1,
            'currency_code' => 'IDR',
            'component_cost' => '10000000.00',
            'fabrication_cost' => '2500000.00',
            'installation_cost' => '1500000.00',
            'other_cost' => '0.00',
            'subtotal' => '14000000.00',
            'discount_amount' => '0.00',
            'tax_amount' => '1540000.00',
            'grand_total' => '15540000.00',
            'lead_time_days' => 21,
            'warranty_months' => 12,
            'notes' => fake()->optional()->sentence(),
            'submitted_at' => null,
        ];
    }

    public function submitted(): static
    {
        return $this->afterCreating(function (QuotationRevision $revision): void {
            app(SubmitQuotationRevision::class)->handle($revision, $revision->quotation->maker);
            $revision->refresh();
        });
    }
}
