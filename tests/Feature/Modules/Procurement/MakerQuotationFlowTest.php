<?php

use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Models\User;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;

beforeEach(function () {
    $this->withoutVite();
});

test('shortlisted maker can create edit and submit quote v1 with items and a technical deviation', function () {
    $maker = MakerProfile::factory()->create();
    $rfq = Rfq::factory()->open()->create([
        'requirements' => [
            'preferred_maker_profile_ids' => [$maker->id],
            'customer_note' => 'Verify all unresolved engineering parameters.',
        ],
    ]);

    $this->actingAs($maker->user)
        ->get('/maker/rfqs')
        ->assertOk();

    $this->actingAs($maker->user)
        ->get("/maker/rfqs/{$rfq->id}")
        ->assertOk();

    $response = $this->actingAs($maker->user)
        ->post("/maker/rfqs/{$rfq->id}/quotation");

    $quotation = Quotation::query()
        ->where('rfq_id', $rfq->id)
        ->where('maker_profile_id', $maker->id)
        ->firstOrFail();
    $revision = $quotation->revisions()->firstOrFail();

    $response->assertRedirect(route('maker.quotations.edit', $quotation));

    expect($quotation->status)->toBe(QuotationStatus::Draft)
        ->and($revision->revision_number)->toBe(1)
        ->and($revision->submitted_at)->toBeNull();

    $this->actingAs($maker->user)
        ->put("/maker/quotations/{$quotation->id}", [
            'items' => [
                [
                    'description' => 'Panel enclosure and incoming assembly',
                    'manufacturer' => 'Local fabrication',
                    'part_number' => null,
                    'quantity' => 1,
                    'unit' => 'set',
                    'unit_price' => 12000000,
                ],
                [
                    'description' => 'Outgoing protection components',
                    'manufacturer' => 'Schneider Electric',
                    'part_number' => 'TBD after verification',
                    'quantity' => 1,
                    'unit' => 'lot',
                    'unit_price' => 8000000,
                ],
            ],
            'fabrication_cost' => 2500000,
            'installation_cost' => 1500000,
            'other_cost' => 0,
            'discount_amount' => 500000,
            'tax_amount' => 0,
            'lead_time_days' => 21,
            'warranty_months' => 12,
            'notes' => 'Final protection selection follows engineering verification.',
            'deviations' => [
                [
                    'baseline_reference' => 'MAIN-INCOMING',
                    'requested_specification' => 'Incoming protection to follow preliminary baseline.',
                    'proposed_specification' => 'Final rating selected after site fault-level verification.',
                    'reason' => 'Fault level is not available in the preliminary engineering input.',
                    'price_impact' => 0,
                    'lead_time_impact_days' => 0,
                ],
            ],
        ])
        ->assertRedirect(route('maker.quotations.edit', $quotation));

    $revision->refresh();

    expect($revision->items)->toHaveCount(2)
        ->and($revision->technicalDeviations)->toHaveCount(1)
        ->and($revision->component_cost)->toBe('20000000.00')
        ->and($revision->subtotal)->toBe('24000000.00')
        ->and($revision->grand_total)->toBe('23500000.00')
        ->and($revision->lead_time_days)->toBe(21);

    $this->actingAs($maker->user)
        ->post("/maker/quotations/{$quotation->id}/submit")
        ->assertRedirect(route('maker.rfqs.show', $rfq));

    $quotation->refresh();
    $revision->refresh();

    expect($quotation->status)->toBe(QuotationStatus::Submitted)
        ->and($quotation->current_revision_id)->toBe($revision->id)
        ->and($revision->submitted_at)->not->toBeNull();
});

test('maker only sees an open RFQ when the shortlist allows it', function () {
    $allowedMaker = MakerProfile::factory()->create();
    $otherMaker = MakerProfile::factory()->create();
    $rfq = Rfq::factory()->create([
        'status' => RfqStatus::Open,
        'requirements' => [
            'preferred_maker_profile_ids' => [$allowedMaker->id],
        ],
    ]);

    $this->actingAs($allowedMaker->user)
        ->get("/maker/rfqs/{$rfq->id}")
        ->assertOk();

    $this->actingAs($otherMaker->user)
        ->get("/maker/rfqs/{$rfq->id}")
        ->assertNotFound();

    $this->actingAs($otherMaker->user)
        ->post("/maker/rfqs/{$rfq->id}/quotation")
        ->assertNotFound();
});

test('customer cannot access maker quotation workspace', function () {
    $customer = User::factory()->customer()->create();

    $this->actingAs($customer)
        ->get('/maker/rfqs')
        ->assertForbidden();
});
