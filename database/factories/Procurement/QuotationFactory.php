<?php

namespace Database\Factories\Procurement;

use App\Actions\Procurement\SubmitQuotationRevision;
use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Procurement\QuotationStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Quotation>
 */
class QuotationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rfq_id' => Rfq::factory()->open(),
            'maker_profile_id' => MakerProfile::factory()->verified(),
            'number' => Str::upper(fake()->unique()->bothify('QUO-####-????')),
            'status' => QuotationStatus::Draft,
            'current_revision_id' => null,
        ];
    }

    public function submitted(): static
    {
        return $this->afterCreating(function (Quotation $quotation): void {
            $revision = QuotationRevision::factory()
                ->for($quotation)
                ->create();

            app(SubmitQuotationRevision::class)->handle($revision, $quotation->maker);
            $quotation->refresh();
        });
    }
}
