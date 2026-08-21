<?php

use App\Actions\Procurement\AcceptQuotationRevision;
use App\Actions\Procurement\CompleteDeal;
use App\Actions\Procurement\RespondToTechnicalDeviation;
use App\Actions\Procurement\SubmitQuotationRevision;
use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Deal;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationItem;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Models\Procurement\TechnicalDeviation;
use App\Models\User;
use App\Procurement\DealStatus;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use App\Procurement\TechnicalDeviationStatus;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

test('RFQ lifecycle cannot regress and keeps publication and closure timestamps coherent', function () {
    $rfq = Rfq::factory()->open()->create();

    expect($rfq->published_at)->not->toBeNull()
        ->and($rfq->closed_at)->toBeNull()
        ->and(fn () => $rfq->update(['status' => RfqStatus::Draft]))
        ->toThrow(LogicException::class, 'RFQ status transition is invalid');

    $rfq->refresh();
    $rfq->update(['status' => RfqStatus::Closed]);

    expect($rfq->status)->toBe(RfqStatus::Closed)
        ->and($rfq->closed_at)->not->toBeNull()
        ->and(fn () => $rfq->update(['status' => RfqStatus::Open]))
        ->toThrow(LogicException::class, 'RFQ status transition is invalid');
});

test('maker submission atomically finalizes a revision and advances its quotation', function () {
    $quotation = Quotation::factory()->create();
    $revision = QuotationRevision::factory()->for($quotation)->create();
    QuotationItem::factory()->for($revision)->create();
    TechnicalDeviation::factory()->for($revision)->create();

    $submittedRevision = app(SubmitQuotationRevision::class)->handle($revision, $quotation->maker);
    $quotation->refresh();

    expect($submittedRevision->submitted_at)->not->toBeNull()
        ->and($quotation->status)->toBe(QuotationStatus::Submitted)
        ->and($quotation->current_revision_id)->toBe($revision->id)
        ->and(fn () => app(SubmitQuotationRevision::class)->handle(
            QuotationRevision::factory()->for($quotation)->create(['revision_number' => 2]),
            MakerProfile::factory()->create(),
        ))->toThrow(DomainException::class, 'Only the quotation maker');
});

test('only the RFQ customer can give one final response to a submitted deviation', function () {
    $quotation = Quotation::factory()->create();
    $revision = QuotationRevision::factory()->for($quotation)->create();
    $deviation = TechnicalDeviation::factory()->for($revision)->create();

    app(SubmitQuotationRevision::class)->handle($revision, $quotation->maker);

    expect(fn () => app(RespondToTechnicalDeviation::class)->handle(
        $deviation,
        User::factory()->customer()->create(),
        TechnicalDeviationStatus::Accepted,
    ))->toThrow(AuthorizationException::class);

    $response = app(RespondToTechnicalDeviation::class)->handle(
        $deviation,
        $quotation->rfq->customer,
        TechnicalDeviationStatus::Accepted,
    );

    expect($response->status)->toBe(TechnicalDeviationStatus::Accepted)
        ->and($response->responded_at)->not->toBeNull()
        ->and(fn () => app(RespondToTechnicalDeviation::class)->handle(
            $response,
            $quotation->rfq->customer,
            TechnicalDeviationStatus::Rejected,
        ))->toThrow(DomainException::class, 'already has a final response')
        ->and(fn () => $response->update([
            'status' => TechnicalDeviationStatus::Rejected,
            'responded_at' => now(),
        ]))->toThrow(LogicException::class, 'response is final');
});

test('accepted deal snapshots preserve RFQ scope and technical deviation decisions separately from price impacts', function () {
    $rfq = Rfq::factory()->open()->create([
        'requirements' => ['installation' => true, 'verification' => 'required'],
        'installation_location' => 'Bandung',
    ]);
    $quotation = Quotation::factory()->create(['rfq_id' => $rfq->id]);
    $revision = QuotationRevision::factory()->for($quotation)->create();
    $deviation = TechnicalDeviation::factory()->for($revision)->create([
        'baseline_reference' => 'protection.incoming',
        'price_impact' => '-300000.00',
        'lead_time_impact_days' => -4,
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
        'ARS-DL-000001',
    );

    expect($deal->technical_snapshot['rfq']['requirements'])->toBe($rfq->requirements)
        ->and($deal->technical_snapshot['rfq']['installation_location'])->toBe('Bandung')
        ->and($deal->technical_snapshot['accepted_technical_deviations'][0]['baseline_reference'])
        ->toBe('protection.incoming')
        ->and($deal->commercial_snapshot['technical_deviation_impacts'][0]['price_impact'])
        ->toBe('-300000.00')
        ->and($deal->commercial_snapshot)->not->toHaveKey('technical_deviations');
});

test('deal aggregate rejects mismatched context through models and database constraints', function () {
    $deal = Deal::factory()->make();
    $deal->rfq_id = Rfq::factory()->open()->create()->id;

    expect(fn () => $deal->save())
        ->toThrow(LogicException::class, 'one coherent RFQ');

    $persistedDeal = Deal::factory()->create();

    expect(fn () => DB::table('deals')
        ->where('id', $persistedDeal->id)
        ->update(['customer_id' => User::factory()->customer()->create()->id]))
        ->toThrow(QueryException::class);
});

test('a deal cannot persist before its RFQ and quotation record the acceptance', function () {
    $quotation = Quotation::factory()->submitted()->create();
    $revision = $quotation->currentRevision;

    expect(fn () => Deal::query()->create([
        'rfq_id' => $quotation->rfq_id,
        'quotation_id' => $quotation->id,
        'quotation_revision_id' => $revision->id,
        'customer_id' => $quotation->rfq->customer_id,
        'maker_profile_id' => $quotation->maker_profile_id,
        'number' => 'ARS-DL-UNSYNCHRONIZED',
        'currency_code' => $revision->currency_code,
        'agreed_value' => $revision->grand_total,
        'lead_time_days' => $revision->lead_time_days,
        'warranty_months' => $revision->warranty_months,
        'technical_snapshot' => ['rfq_id' => $quotation->rfq_id],
        'commercial_snapshot' => ['quotation_revision_id' => $revision->id],
        'accepted_at' => now(),
    ]))->toThrow(LogicException::class, 'requires an awarded RFQ and an accepted quotation');
});

test('deal factories represent a coherent accepted aggregate', function () {
    $deal = Deal::factory()->create();

    expect($deal->quotation->status)->toBe(QuotationStatus::Accepted)
        ->and($deal->quotation->current_revision_id)->toBe($deal->quotation_revision_id)
        ->and($deal->rfq->status)->toBe(RfqStatus::Awarded)
        ->and($deal->agreed_value)->toBe($deal->quotationRevision->grand_total);
});

test('persisted procurement states defeat stale model lifecycle regressions', function () {
    $quotation = Quotation::factory()->submitted()->create();
    $staleQuotation = Quotation::query()->findOrFail($quotation->id);
    $staleRfq = Rfq::query()->findOrFail($quotation->rfq_id);

    app(AcceptQuotationRevision::class)->handle(
        $quotation->currentRevision,
        $quotation->rfq->customer,
        'ARS-DL-STALE-LIFECYCLE',
    );

    expect(fn () => $staleQuotation->update(['status' => QuotationStatus::Withdrawn]))
        ->toThrow(LogicException::class, 'quotations are immutable')
        ->and(fn () => $staleRfq->update(['status' => RfqStatus::Cancelled]))
        ->toThrow(LogicException::class, 'RFQ status transition is invalid');

    $deal = Deal::factory()->create();
    $staleDeal = Deal::query()->findOrFail($deal->id);

    app(CompleteDeal::class)->handle($deal);

    expect(fn () => $staleDeal->update(['status' => DealStatus::Cancelled]))
        ->toThrow(LogicException::class, 'deal status transition is invalid');
});

test('a stale technical deviation cannot replace a persisted final response', function () {
    $quotation = Quotation::factory()->create();
    $revision = QuotationRevision::factory()->for($quotation)->create();
    $deviation = TechnicalDeviation::factory()->for($revision)->create();
    $staleDeviation = TechnicalDeviation::query()->findOrFail($deviation->id);

    app(SubmitQuotationRevision::class)->handle($revision, $quotation->maker);
    app(RespondToTechnicalDeviation::class)->handle(
        $deviation,
        $quotation->rfq->customer,
        TechnicalDeviationStatus::Accepted,
    );

    expect(fn () => $staleDeviation->update([
        'status' => TechnicalDeviationStatus::Rejected,
        'responded_at' => now(),
    ]))->toThrow(LogicException::class, 'response is final');
});
