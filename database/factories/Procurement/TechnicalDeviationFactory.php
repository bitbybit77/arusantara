<?php

namespace Database\Factories\Procurement;

use App\Actions\Procurement\RespondToTechnicalDeviation;
use App\Actions\Procurement\SubmitQuotationRevision;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\TechnicalDeviation;
use App\Procurement\TechnicalDeviationStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TechnicalDeviation>
 */
class TechnicalDeviationFactory extends Factory
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
            'baseline_reference' => 'protection.incoming',
            'requested_specification' => 'Requested MCCB specification',
            'proposed_specification' => 'Equivalent MCCB specification',
            'reason' => 'Product availability',
            'price_impact' => '-300000.00',
            'lead_time_impact_days' => -4,
            'status' => TechnicalDeviationStatus::Pending,
            'responded_at' => null,
        ];
    }

    public function accepted(): static
    {
        return $this->afterCreating(function (TechnicalDeviation $deviation): void {
            $revision = $deviation->quotationRevision;

            app(SubmitQuotationRevision::class)->handle($revision, $revision->quotation->maker);
            app(RespondToTechnicalDeviation::class)->handle(
                $deviation,
                $revision->quotation->rfq->customer,
                TechnicalDeviationStatus::Accepted,
            );

            $deviation->refresh();
        });
    }
}
