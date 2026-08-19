<?php

namespace Database\Factories\Procurement;

use App\Actions\Procurement\CompleteDeal;
use App\Models\Procurement\Deal;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Procurement\DealStatus;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Deal>
 */
class DealFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quotation_id' => Quotation::factory()->submitted(),
            'quotation_revision_id' => fn (array $attributes): int => (int) Quotation::query()
                ->whereKey($attributes['quotation_id'])
                ->value('current_revision_id'),
            'rfq_id' => fn (array $attributes): int => (int) Quotation::query()
                ->whereKey($attributes['quotation_id'])
                ->value('rfq_id'),
            'customer_id' => fn (array $attributes): int => (int) Rfq::query()
                ->whereKey($attributes['rfq_id'])
                ->value('customer_id'),
            'maker_profile_id' => fn (array $attributes): int => (int) Quotation::query()
                ->whereKey($attributes['quotation_id'])
                ->value('maker_profile_id'),
            'number' => Str::upper(fake()->unique()->bothify('DEAL-####-????')),
            'status' => DealStatus::Accepted,
            'currency_code' => fn (array $attributes): string => (string) QuotationRevision::query()
                ->whereKey($attributes['quotation_revision_id'])
                ->value('currency_code'),
            'agreed_value' => fn (array $attributes): string => (string) QuotationRevision::query()
                ->whereKey($attributes['quotation_revision_id'])
                ->value('grand_total'),
            'lead_time_days' => fn (array $attributes): ?int => QuotationRevision::query()
                ->whereKey($attributes['quotation_revision_id'])
                ->value('lead_time_days'),
            'warranty_months' => fn (array $attributes): ?int => QuotationRevision::query()
                ->whereKey($attributes['quotation_revision_id'])
                ->value('warranty_months'),
            'technical_snapshot' => fn (array $attributes): array => [
                'rfq_id' => $attributes['rfq_id'],
                'calculation_snapshot_id' => Rfq::query()
                    ->whereKey($attributes['rfq_id'])
                    ->value('calculation_snapshot_id'),
            ],
            'commercial_snapshot' => fn (array $attributes): array => [
                'quotation_revision_id' => $attributes['quotation_revision_id'],
                'grand_total' => QuotationRevision::query()
                    ->whereKey($attributes['quotation_revision_id'])
                    ->value('grand_total'),
            ],
            'accepted_at' => now(),
            'completed_at' => null,
            'closed_at' => null,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Deal $deal): void {
            $deal->quotation->update([
                'current_revision_id' => $deal->quotation_revision_id,
                'status' => QuotationStatus::Accepted,
            ]);
            $deal->rfq->update([
                'status' => RfqStatus::Awarded,
                'closed_at' => $deal->accepted_at,
            ]);
        });
    }

    public function completed(): static
    {
        return $this->afterCreating(function (Deal $deal): void {
            app(CompleteDeal::class)->handle($deal);
            $deal->refresh();
        });
    }
}
