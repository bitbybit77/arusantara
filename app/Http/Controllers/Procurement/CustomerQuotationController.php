<?php

namespace App\Http\Controllers\Procurement;

use App\Actions\Procurement\AcceptQuotationRevision;
use App\Actions\Procurement\RespondToTechnicalDeviation;
use App\Actions\Procurement\StartQuotationNegotiation;
use App\Http\Controllers\Controller;
use App\Models\Procurement\Deal;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationItem;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\TechnicalDeviation;
use App\Models\User;
use App\Procurement\QuotationStatus;
use App\Procurement\TechnicalDeviationStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerQuotationController extends Controller
{
    public function show(Request $request, Quotation $quotation): Response
    {
        $customer = $this->customer($request);
        $this->ensureQuotationOwnedByCustomer($quotation, $customer);

        abort_if($quotation->status === QuotationStatus::Draft, 404);

        $quotation->load([
            'rfq.project',
            'maker',
            'currentRevision.items' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            'currentRevision.technicalDeviations' => fn ($query) => $query->orderBy('id'),
            'deal',
        ]);

        $revision = $quotation->currentRevision;
        abort_unless($revision instanceof QuotationRevision && $revision->submitted_at !== null, 404);

        $canAccept = in_array($quotation->status, [QuotationStatus::Submitted, QuotationStatus::Negotiating], true)
            && $revision->technicalDeviations->every(
                fn (TechnicalDeviation $deviation): bool => $deviation->status === TechnicalDeviationStatus::Accepted,
            );

        $canDiscuss = in_array($quotation->status, [QuotationStatus::Submitted, QuotationStatus::Negotiating], true)
            && $quotation->deal === null;

        return Inertia::render('quotations/show', [
            'quotation' => [
                'id' => (int) $quotation->getKey(),
                'number' => $quotation->number,
                'status' => $this->enumValue($quotation->status),
                'can_accept' => $canAccept,
                'can_discuss' => $canDiscuss,
            ],
            'rfq' => [
                'id' => (int) $quotation->rfq->getKey(),
                'number' => $quotation->rfq->number,
                'title' => $quotation->rfq->title,
                'status' => $this->enumValue($quotation->rfq->status),
                'project_name' => $quotation->rfq->project->name,
            ],
            'maker' => [
                'id' => (int) $quotation->maker->getKey(),
                'business_name' => $quotation->maker->business_name,
                'city' => $quotation->maker->city,
                'verification_status' => $this->enumValue($quotation->maker->verification_status),
            ],
            'revision' => [
                'id' => (int) $revision->getKey(),
                'revision_number' => (int) $revision->revision_number,
                'currency_code' => $revision->currency_code,
                'component_cost' => (float) $revision->component_cost,
                'fabrication_cost' => (float) $revision->fabrication_cost,
                'installation_cost' => (float) $revision->installation_cost,
                'other_cost' => (float) $revision->other_cost,
                'subtotal' => (float) $revision->subtotal,
                'discount_amount' => (float) $revision->discount_amount,
                'tax_amount' => (float) $revision->tax_amount,
                'grand_total' => (float) $revision->grand_total,
                'lead_time_days' => $revision->lead_time_days,
                'warranty_months' => $revision->warranty_months,
                'notes' => $revision->notes,
                'submitted_at' => $revision->submitted_at->toIso8601String(),
                'items' => $revision->items()
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->get()
                    ->map(fn (QuotationItem $item): array => [
                        'id' => (int) $item->getKey(),
                        'description' => $item->description,
                        'manufacturer' => $item->manufacturer,
                        'part_number' => $item->part_number,
                        'quantity' => (float) $item->quantity,
                        'unit' => $item->unit,
                        'unit_price' => (float) $item->unit_price,
                        'line_total' => (float) $item->line_total,
                    ])
                    ->values(),
                'deviations' => $revision->technicalDeviations
                    ->map(fn (TechnicalDeviation $deviation): array => [
                        'id' => (int) $deviation->getKey(),
                        'baseline_reference' => $deviation->baseline_reference,
                        'requested_specification' => $deviation->requested_specification,
                        'proposed_specification' => $deviation->proposed_specification,
                        'reason' => $deviation->reason,
                        'price_impact' => (float) $deviation->price_impact,
                        'lead_time_impact_days' => (int) $deviation->lead_time_impact_days,
                        'status' => $this->enumValue($deviation->status),
                    ])
                    ->values(),
            ],
            'deal' => $quotation->deal === null ? null : [
                'id' => (int) $quotation->deal->getKey(),
                'number' => $quotation->deal->number,
                'status' => $this->enumValue($quotation->deal->status),
                'agreed_value' => (float) $quotation->deal->agreed_value,
            ],
        ]);
    }

    public function respondToDeviation(
        Request $request,
        Quotation $quotation,
        TechnicalDeviation $technicalDeviation,
        RespondToTechnicalDeviation $respondToTechnicalDeviation,
        StartQuotationNegotiation $startQuotationNegotiation,
    ): RedirectResponse {
        $customer = $this->customer($request);
        $this->ensureQuotationOwnedByCustomer($quotation, $customer);
        $this->ensureDeviationBelongsToCurrentRevision($quotation, $technicalDeviation);

        $validated = $request->validate([
            'response' => [
                'required',
                'string',
                Rule::in([
                    TechnicalDeviationStatus::Accepted->value,
                    TechnicalDeviationStatus::Rejected->value,
                ]),
            ],
        ]);

        $response = TechnicalDeviationStatus::from((string) $validated['response']);
        $respondToTechnicalDeviation->handle($technicalDeviation, $customer, $response);

        if ($response === TechnicalDeviationStatus::Rejected) {
            $startQuotationNegotiation->handle($quotation, $customer);
        }

        return redirect()->route('quotations.show', $quotation);
    }

    public function discuss(
        Request $request,
        Quotation $quotation,
        StartQuotationNegotiation $startQuotationNegotiation,
    ): RedirectResponse {
        $customer = $this->customer($request);
        $this->ensureQuotationOwnedByCustomer($quotation, $customer);

        $startQuotationNegotiation->handle($quotation, $customer);

        return redirect()
            ->route('quotations.show', $quotation)
            ->with('success', 'Negotiation started. Panel maker can prepare a revised quotation.');
    }

    public function accept(
        Request $request,
        Quotation $quotation,
        AcceptQuotationRevision $acceptQuotationRevision,
    ): RedirectResponse {
        $customer = $this->customer($request);
        $this->ensureQuotationOwnedByCustomer($quotation, $customer);

        $revision = $quotation->currentRevision()->firstOrFail();
        $acceptQuotationRevision->handle($revision, $customer, $this->uniqueDealNumber());

        return redirect()
            ->route('quotations.show', $quotation)
            ->with('success', 'Quotation accepted and deal created.');
    }

    private function customer(Request $request): User
    {
        $customer = $request->user();

        if (! $customer instanceof User || ! $customer->isCustomer()) {
            abort(403);
        }

        return $customer;
    }

    private function ensureQuotationOwnedByCustomer(Quotation $quotation, User $customer): void
    {
        $quotation->loadMissing('rfq');
        abort_unless((int) $quotation->rfq->customer_id === (int) $customer->getKey(), 404);
    }

    private function ensureDeviationBelongsToCurrentRevision(
        Quotation $quotation,
        TechnicalDeviation $technicalDeviation,
    ): void {
        abort_unless(
            $quotation->current_revision_id !== null
                && (int) $technicalDeviation->quotation_revision_id === (int) $quotation->current_revision_id,
            404,
        );
    }

    private function uniqueDealNumber(): string
    {
        do {
            $number = 'DEAL-ARU-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (Deal::query()->where('number', $number)->exists());

        return $number;
    }

    private function enumValue(mixed $value): mixed
    {
        return $value instanceof \BackedEnum ? $value->value : $value;
    }
}
