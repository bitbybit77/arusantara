<?php

use App\Actions\Procurement\AcceptQuotationRevision;
use App\Actions\Procurement\CreateRfqFromCalculationSnapshot;
use App\Actions\Procurement\RespondToTechnicalDeviation;
use App\Actions\Procurement\SubmitQuotationRevision;
use App\Actions\Procurement\UpdateQuotationDraft;
use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationLine;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Procurement\Deal;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationItem;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Models\Procurement\TechnicalDeviation;
use App\Models\User;
use App\Procurement\DealStatus;
use App\Procurement\QuotationItemType;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use App\Procurement\TechnicalDeviationStatus;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

test('an RFQ is created from a frozen calculation snapshot owned by its customer', function () {
    $customer = User::factory()->customer()->create();
    $project = Project::factory()->create(['customer_id' => $customer->id]);
    $configuration = ProjectConfiguration::factory()->locked()->create([
        'project_id' => $project->id,
        'created_by_user_id' => $customer->id,
    ]);
    $snapshot = CalculationSnapshot::factory()->create([
        'project_configuration_id' => $configuration->id,
        'calculated_by_user_id' => $customer->id,
    ]);

    $rfq = app(CreateRfqFromCalculationSnapshot::class)->handle(
        calculationSnapshot: $snapshot,
        customer: $customer,
        number: 'RFQ-ARU-0001',
        title: 'Laundry preliminary panel',
        requirements: ['installation' => true],
        installationLocation: 'Bandung',
        dueAt: now()->addDays(14),
    );

    expect($rfq->project->is($project))->toBeTrue()
        ->and($rfq->calculationSnapshot->is($snapshot))->toBeTrue()
        ->and($rfq->customer->is($customer))->toBeTrue()
        ->and($rfq->status)->toBe(RfqStatus::Draft)
        ->and($rfq->requirements)->toBe(['installation' => true]);

    $otherCustomer = User::factory()->customer()->create();

    expect(fn () => app(CreateRfqFromCalculationSnapshot::class)->handle(
        $snapshot,
        $otherCustomer,
        'RFQ-ARU-0002',
        'Invalid customer RFQ',
    ))->toThrow(DomainException::class, 'does not belong to this customer');
});

test('a quotation requires a maker and keeps revision history', function () {
    $rfq = Rfq::factory()->open()->create();

    expect(fn () => Quotation::factory()->create([
        'rfq_id' => $rfq->id,
        'maker_profile_id' => null,
    ]))->toThrow(QueryException::class);

    $quotation = Quotation::factory()->create(['rfq_id' => $rfq->id]);
    $firstRevision = QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 1,
    ]);
    $secondRevision = QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 2,
    ]);

    $item = QuotationItem::factory()->create([
        'quotation_revision_id' => $secondRevision->id,
        'type' => QuotationItemType::Component,
        'description' => 'Incoming MCCB',
    ]);
    $deviation = TechnicalDeviation::factory()->create([
        'quotation_revision_id' => $secondRevision->id,
    ]);

    app(SubmitQuotationRevision::class)->handle($secondRevision, $quotation->maker);

    expect($quotation->revisions()->pluck('revision_number')->all())->toBe([1, 2])
        ->and($quotation->fresh()->currentRevision->is($secondRevision))->toBeTrue()
        ->and($item->quotationRevision->is($secondRevision))->toBeTrue()
        ->and($deviation->quotationRevision->is($secondRevision))->toBeTrue()
        ->and(Schema::hasColumn('quotation_items', 'configuration_line_id'))->toBeFalse();

    expect(fn () => QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 2,
    ]))->toThrow(QueryException::class);
});

test('accepting a submitted revision creates a deal with frozen technical and commercial snapshots', function () {
    $snapshot = CalculationSnapshot::factory()->unfinalized()->create();
    $calculationLine = CalculationLine::factory()->for($snapshot, 'calculationSnapshot')->create([
        'line_code' => 'MAIN-INCOMING',
        'description' => 'Recommended incoming protection',
    ]);
    $snapshot->finalize();
    $rfq = Rfq::factory()->open()->create([
        'calculation_snapshot_id' => $snapshot->id,
    ]);
    $quotation = Quotation::factory()->submitted()->create(['rfq_id' => $rfq->id]);
    $revision = QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 2,
        'component_cost' => '17000000.00',
        'fabrication_cost' => '0.00',
        'installation_cost' => '0.00',
        'subtotal' => '17000000.00',
        'tax_amount' => '1750000.00',
        'grand_total' => '18750000.00',
    ]);
    $item = QuotationItem::factory()->create([
        'quotation_revision_id' => $revision->id,
        'description' => 'Panel enclosure',
        'unit_price' => '2500000.00',
        'line_total' => '2500000.00',
    ]);
    $deviation = TechnicalDeviation::factory()->create([
        'quotation_revision_id' => $revision->id,
    ]);
    app(SubmitQuotationRevision::class)->handle($revision, $quotation->maker);
    app(RespondToTechnicalDeviation::class)->handle(
        $deviation,
        $rfq->customer,
        TechnicalDeviationStatus::Accepted,
    );

    $deal = app(AcceptQuotationRevision::class)->handle(
        $revision,
        $rfq->customer,
        'DEAL-ARU-0001',
    );

    expect($deal->status)->toBe(DealStatus::Accepted)
        ->and($deal->rfq->is($rfq))->toBeTrue()
        ->and($deal->quotation->is($quotation))->toBeTrue()
        ->and($deal->quotationRevision->is($revision))->toBeTrue()
        ->and($deal->maker->is($quotation->maker))->toBeTrue()
        ->and($deal->agreed_value)->toBe('18750000.00')
        ->and($deal->technical_snapshot['calculation_snapshot_id'])->toBe($rfq->calculation_snapshot_id)
        ->and($deal->technical_snapshot['lines'][0]['line_code'])->toBe($calculationLine->line_code)
        ->and($deal->commercial_snapshot['items'][0]['description'])->toBe('Panel enclosure')
        ->and($quotation->fresh()->status)->toBe(QuotationStatus::Accepted)
        ->and($quotation->fresh()->current_revision_id)->toBe($revision->id)
        ->and($rfq->fresh()->status)->toBe(RfqStatus::Awarded);

    expect(fn () => $revision->update([
        'grand_total' => '99999999.00',
    ]))->toThrow(LogicException::class, 'revisions are immutable')
        ->and(fn () => $item->update([
            'description' => 'Changed after acceptance',
        ]))->toThrow(LogicException::class, 'Items on submitted');

    expect($deal->fresh()->agreed_value)->toBe('18750000.00')
        ->and($deal->fresh()->commercial_snapshot['items'][0]['description'])->toBe('Panel enclosure');
});

test('a quotation cannot be awarded by another customer or with unresolved technical deviations', function () {
    $rfq = Rfq::factory()->open()->create();
    $quotation = Quotation::factory()->submitted()->create(['rfq_id' => $rfq->id]);
    $revision = QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 2,
    ]);
    TechnicalDeviation::factory()->create([
        'quotation_revision_id' => $revision->id,
    ]);
    app(SubmitQuotationRevision::class)->handle($revision, $quotation->maker);

    expect(fn () => app(AcceptQuotationRevision::class)->handle(
        $revision,
        User::factory()->customer()->create(),
        'DEAL-ARU-INVALID-CUSTOMER',
    ))->toThrow(DomainException::class, 'Only the RFQ customer');

    expect(fn () => app(AcceptQuotationRevision::class)->handle(
        $revision,
        $rfq->customer,
        'DEAL-ARU-PENDING-DEVIATION',
    ))->toThrow(DomainException::class, 'technical deviations must be accepted')
        ->and(Deal::query()->where('rfq_id', $rfq->id)->exists())->toBeFalse();
});

test('only one deal can award an RFQ', function () {
    $deal = Deal::factory()->create();

    $duplicate = (array) DB::table('deals')->where('id', $deal->id)->first();
    unset($duplicate['id']);
    $duplicate['number'] = 'ARS-DL-DUPLICATE';

    expect(fn () => DB::table('deals')->insert($duplicate))->toThrow(QueryException::class);
});

test('a quotation current revision must belong to that quotation', function () {
    $firstQuotation = Quotation::factory()->create();
    $secondQuotation = Quotation::factory()->create();
    $foreignRevision = QuotationRevision::factory()->for($firstQuotation)->create();

    expect(fn () => DB::table('quotations')
        ->where('id', $secondQuotation->id)
        ->update(['current_revision_id' => $foreignRevision->id]))
        ->toThrow(QueryException::class);
});

test('an older submitted quotation revision cannot be accepted', function () {
    $rfq = Rfq::factory()->open()->create();
    $quotation = Quotation::factory()->create(['rfq_id' => $rfq->id]);
    $firstRevision = QuotationRevision::factory()->submitted()->for($quotation)->create([
        'revision_number' => 1,
    ]);
    $secondRevision = QuotationRevision::factory()->submitted()->for($quotation)->create([
        'revision_number' => 2,
    ]);

    expect(fn () => app(AcceptQuotationRevision::class)->handle(
        $firstRevision,
        $rfq->customer,
        'DEAL-ARU-STALE-REVISION',
    ))->toThrow(DomainException::class, 'current quotation revision');
});

test('submitted quotation children cannot be moved to another revision', function () {
    $quotation = Quotation::factory()->create();
    $submittedRevision = QuotationRevision::factory()->for($quotation)->create();
    $draftRevision = QuotationRevision::factory()->for($quotation)->create([
        'revision_number' => 2,
    ]);
    $item = QuotationItem::factory()->for($submittedRevision)->create();
    $deviation = TechnicalDeviation::factory()->for($submittedRevision)->create();

    app(SubmitQuotationRevision::class)->handle($submittedRevision, $quotation->maker);

    expect(fn () => $item->update([
        'quotation_revision_id' => $draftRevision->id,
    ]))->toThrow(LogicException::class, 'cannot be moved')
        ->and(fn () => $deviation->update([
            'quotation_revision_id' => $draftRevision->id,
        ]))->toThrow(LogicException::class, 'cannot be moved');
});

test('a quotation draft accepts a normal discount and calculates the grand total exactly', function () {
    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Draft->value,
    ]);

    QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 1,
        'submitted_at' => null,
    ]);

    $revision = app(UpdateQuotationDraft::class)->handle(
        quotation: $quotation,
        maker: $quotation->maker,
        items: [
            [
                'description' => 'Main panel component',
                'manufacturer' => 'Demo Manufacturer',
                'part_number' => 'DP-001',
                'quantity' => 2,
                'unit' => 'unit',
                'unit_price' => 100000,
            ],
        ],
        fabricationCost: 50000,
        installationCost: 0,
        otherCost: 0,
        discountAmount: 50000,
        taxAmount: 25000,
        leadTimeDays: 14,
        warrantyMonths: 12,
        notes: 'Normal discount regression case.',
    );

    expect((float) $revision->component_cost)->toBe(200000.0)
        ->and((float) $revision->subtotal)->toBe(250000.0)
        ->and((float) $revision->discount_amount)->toBe(50000.0)
        ->and((float) $revision->tax_amount)->toBe(25000.0)
        ->and((float) $revision->grand_total)->toBe(225000.0);
});

test('a quotation draft allows discount exactly equal to subtotal plus tax and reaches zero grand total', function () {
    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Draft->value,
    ]);

    QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 1,
        'submitted_at' => null,
    ]);

    $revision = app(UpdateQuotationDraft::class)->handle(
        quotation: $quotation,
        maker: $quotation->maker,
        items: [
            [
                'description' => 'Panel enclosure',
                'quantity' => 1,
                'unit' => 'unit',
                'unit_price' => 100000,
            ],
        ],
        fabricationCost: 50000,
        installationCost: 0,
        otherCost: 0,
        discountAmount: 165000,
        taxAmount: 15000,
        leadTimeDays: null,
        warrantyMonths: null,
        notes: 'Maximum allowed discount regression case.',
    );

    expect((float) $revision->subtotal)->toBe(150000.0)
        ->and((float) $revision->tax_amount)->toBe(15000.0)
        ->and((float) $revision->discount_amount)->toBe(165000.0)
        ->and((float) $revision->grand_total)->toBe(0.0);
});

test('a quotation draft rejects excessive discount before the database constraint and rolls back the draft mutation', function () {
    $quotation = Quotation::factory()->create([
        'status' => QuotationStatus::Draft->value,
    ]);

    $revision = QuotationRevision::factory()->create([
        'quotation_id' => $quotation->id,
        'revision_number' => 1,
        'submitted_at' => null,
        'component_cost' => '100000.00',
        'fabrication_cost' => '0.00',
        'installation_cost' => '0.00',
        'other_cost' => '0.00',
        'subtotal' => '100000.00',
        'discount_amount' => '0.00',
        'tax_amount' => '10000.00',
        'grand_total' => '110000.00',
    ]);

    $existingItem = QuotationItem::factory()->create([
        'quotation_revision_id' => $revision->id,
        'type' => QuotationItemType::Component,
        'description' => 'Existing draft item',
        'quantity' => 1,
        'unit' => 'unit',
        'unit_price' => '100000.00',
        'line_total' => '100000.00',
    ]);

    expect(fn () => app(UpdateQuotationDraft::class)->handle(
        quotation: $quotation,
        maker: $quotation->maker,
        items: [
            [
                'description' => 'Replacement item',
                'quantity' => 1,
                'unit' => 'unit',
                'unit_price' => 100000,
            ],
        ],
        fabricationCost: 0,
        installationCost: 0,
        otherCost: 0,
        discountAmount: 110001,
        taxAmount: 10000,
        leadTimeDays: null,
        warrantyMonths: null,
        notes: 'This mutation must be rolled back.',
    ))->toThrow(
        DomainException::class,
        'Discount amount may not exceed subtotal plus tax amount.',
    );

    $revision->refresh();

    expect((float) $revision->grand_total)->toBe(110000.0)
        ->and((float) $revision->discount_amount)->toBe(0.0)
        ->and($revision->items()->count())->toBe(1)
        ->and($revision->items()->first()?->is($existingItem))->toBeTrue()
        ->and($revision->items()->first()?->description)->toBe('Existing draft item');
});
