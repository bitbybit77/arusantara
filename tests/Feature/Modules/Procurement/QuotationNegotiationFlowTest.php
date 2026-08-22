<?php

use App\Actions\Procurement\SubmitQuotationRevision;
use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Deal;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationItem;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Models\Procurement\TechnicalDeviation;
use App\Models\User;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use App\Procurement\TechnicalDeviationStatus;

beforeEach(function () {
    $this->withoutVite();
});

test('customer can discuss quote v1 maker can submit v2 and customer can award it', function () {
    $rfq = Rfq::factory()->open()->create();
    $customer = $rfq->customer;
    $maker = MakerProfile::factory()->create();
    $quotation = Quotation::factory()->create([
        'rfq_id' => $rfq->id,
        'maker_profile_id' => $maker->id,
    ]);
    $revisionOne = QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 1,
        'component_cost' => '12000000.00',
        'subtotal' => '12000000.00',
        'grand_total' => '12000000.00',
        'lead_time_days' => 21,
    ]);
    QuotationItem::factory()->create([
        'quotation_revision_id' => $revisionOne->id,
        'description' => 'Panel assembly V1',
        'quantity' => '1.000',
        'unit' => 'set',
        'unit_price' => '12000000.00',
        'line_total' => '12000000.00',
    ]);
    TechnicalDeviation::factory()->create([
        'quotation_revision_id' => $revisionOne->id,
        'baseline_reference' => 'MAIN-INCOMING',
    ]);

    app(SubmitQuotationRevision::class)->handle($revisionOne, $maker);

    $this->actingAs($customer)
        ->get("/quotations/{$quotation->id}")
        ->assertOk();

    $this->actingAs($customer)
        ->post("/quotations/{$quotation->id}/discuss")
        ->assertRedirect(route('quotations.show', $quotation));

    expect($quotation->fresh()->status)->toBe(QuotationStatus::Negotiating)
        ->and($rfq->fresh()->status)->toBe(RfqStatus::Negotiating);

    $this->actingAs($maker->user)
        ->post("/maker/quotations/{$quotation->id}/revisions")
        ->assertRedirect(route('maker.quotations.edit', $quotation));

    $revisionTwo = QuotationRevision::query()
        ->where('quotation_id', $quotation->id)
        ->whereNull('submitted_at')
        ->firstOrFail();

    expect($revisionTwo->revision_number)->toBe(2)
        ->and($revisionTwo->items)->toHaveCount(1)
        ->and($revisionTwo->technicalDeviations)->toHaveCount(1)
        ->and($revisionTwo->technicalDeviations->first()?->status)->toBe(TechnicalDeviationStatus::Pending);

    $this->actingAs($maker->user)
        ->put("/maker/quotations/{$quotation->id}", [
            'items' => [
                [
                    'description' => 'Panel assembly revised',
                    'manufacturer' => 'Arusantara Maker',
                    'part_number' => null,
                    'quantity' => 1,
                    'unit' => 'set',
                    'unit_price' => 12500000,
                ],
            ],
            'fabrication_cost' => 1500000,
            'installation_cost' => 1000000,
            'other_cost' => 0,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'lead_time_days' => 18,
            'warranty_months' => 12,
            'notes' => 'Quote V2 after customer discussion.',
            'deviations' => [
                [
                    'baseline_reference' => 'MAIN-INCOMING',
                    'requested_specification' => 'Follow preliminary baseline.',
                    'proposed_specification' => 'Final rating after site verification.',
                    'reason' => 'Fault level requires site verification.',
                    'price_impact' => 0,
                    'lead_time_impact_days' => 0,
                ],
            ],
        ])
        ->assertRedirect(route('maker.quotations.edit', $quotation));

    $this->actingAs($maker->user)
        ->post("/maker/quotations/{$quotation->id}/submit")
        ->assertRedirect(route('maker.rfqs.show', $rfq));

    $quotation->refresh();
    $revisionTwo->refresh();
    $deviationTwo = $revisionTwo->technicalDeviations()->firstOrFail();

    expect($quotation->status)->toBe(QuotationStatus::Negotiating)
        ->and($quotation->current_revision_id)->toBe($revisionTwo->id)
        ->and($revisionTwo->submitted_at)->not->toBeNull();

    $this->actingAs($customer)
        ->post("/quotations/{$quotation->id}/deviations/{$deviationTwo->id}/respond", [
            'response' => TechnicalDeviationStatus::Accepted->value,
        ])
        ->assertRedirect(route('quotations.show', $quotation));

    $this->actingAs($customer)
        ->post("/quotations/{$quotation->id}/accept")
        ->assertRedirect(route('quotations.show', $quotation));

    $deal = Deal::query()->where('quotation_id', $quotation->id)->firstOrFail();

    expect($deviationTwo->fresh()->status)->toBe(TechnicalDeviationStatus::Accepted)
        ->and($quotation->fresh()->status)->toBe(QuotationStatus::Accepted)
        ->and($rfq->fresh()->status)->toBe(RfqStatus::Awarded)
        ->and($deal->quotation_revision_id)->toBe($revisionTwo->id)
        ->and($deal->agreed_value)->toBe($revisionTwo->grand_total);
});

test('rejecting a technical deviation moves the quotation into negotiation', function () {
    $rfq = Rfq::factory()->open()->create();
    $maker = MakerProfile::factory()->create();
    $quotation = Quotation::factory()->create([
        'rfq_id' => $rfq->id,
        'maker_profile_id' => $maker->id,
    ]);
    $revision = QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 1,
    ]);
    $deviation = TechnicalDeviation::factory()->create([
        'quotation_revision_id' => $revision->id,
    ]);

    app(SubmitQuotationRevision::class)->handle($revision, $maker);

    $this->actingAs($rfq->customer)
        ->post("/quotations/{$quotation->id}/deviations/{$deviation->id}/respond", [
            'response' => TechnicalDeviationStatus::Rejected->value,
        ])
        ->assertRedirect(route('quotations.show', $quotation));

    expect($deviation->fresh()->status)->toBe(TechnicalDeviationStatus::Rejected)
        ->and($quotation->fresh()->status)->toBe(QuotationStatus::Negotiating)
        ->and($rfq->fresh()->status)->toBe(RfqStatus::Negotiating);
});

test('another customer cannot review or negotiate a quotation', function () {
    $rfq = Rfq::factory()->open()->create();
    $quotation = Quotation::factory()->submitted()->create(['rfq_id' => $rfq->id]);
    $otherCustomer = User::factory()->customer()->create();

    $this->actingAs($otherCustomer)
        ->get("/quotations/{$quotation->id}")
        ->assertNotFound();

    $this->actingAs($otherCustomer)
        ->post("/quotations/{$quotation->id}/discuss")
        ->assertNotFound();
});
