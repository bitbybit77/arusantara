<?php

namespace App\Http\Controllers\Procurement;

use App\Actions\Procurement\CreateQuotationDraft;
use App\Actions\Procurement\SubmitQuotationRevision;
use App\Actions\Procurement\UpdateQuotationDraft;
use App\Http\Controllers\Controller;
use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\QuotationRevision;
use App\Models\Procurement\Rfq;
use App\Models\User;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MakerQuotationController extends Controller
{
    public function index(Request $request): Response
    {
        $maker = $this->maker($request);

        $rfqs = Rfq::query()
            ->with(['project:id,code,name,business_category', 'customer:id,name'])
            ->whereIn('status', [RfqStatus::Open->value, RfqStatus::Negotiating->value])
            ->orderByDesc('published_at')
            ->get()
            ->filter(fn (Rfq $rfq): bool => $this->isVisibleToMaker($rfq, $maker))
            ->map(function (Rfq $rfq) use ($maker): array {
                $quotation = Quotation::query()
                    ->where('rfq_id', $rfq->getKey())
                    ->where('maker_profile_id', $maker->getKey())
                    ->first();

                return [
                    'id' => (int) $rfq->getKey(),
                    'number' => $rfq->number,
                    'title' => $rfq->title,
                    'status' => $this->enumValue($rfq->status),
                    'installation_location' => $rfq->installation_location,
                    'due_at' => $rfq->due_at?->format('Y-m-d'),
                    'published_at' => $rfq->published_at?->toIso8601String(),
                    'project' => [
                        'code' => $rfq->project->code,
                        'name' => $rfq->project->name,
                        'business_category' => $rfq->project->business_category,
                    ],
                    'customer_name' => $rfq->customer->name,
                    'quotation' => $quotation === null ? null : [
                        'id' => (int) $quotation->getKey(),
                        'number' => $quotation->number,
                        'status' => $this->enumValue($quotation->status),
                    ],
                ];
            })
            ->values();

        return Inertia::render('maker/rfqs/index', [
            'maker' => [
                'id' => (int) $maker->getKey(),
                'business_name' => $maker->business_name,
                'city' => $maker->city,
                'verification_status' => $this->enumValue($maker->verification_status),
            ],
            'rfqs' => $rfqs,
        ]);
    }

    public function show(Request $request, Rfq $rfq): Response
    {
        $maker = $this->maker($request);
        $this->ensureVisibleToMaker($rfq, $maker);

        $rfq->load(['project', 'customer', 'calculationSnapshot']);
        $quotation = Quotation::query()
            ->where('rfq_id', $rfq->getKey())
            ->where('maker_profile_id', $maker->getKey())
            ->first();

        $snapshot = $rfq->calculationSnapshot;
        $requirements = $rfq->requirements;
        $customerNote = $requirements['customer_note'] ?? null;

        return Inertia::render('maker/rfqs/show', [
            'rfq' => [
                'id' => (int) $rfq->getKey(),
                'number' => $rfq->number,
                'title' => $rfq->title,
                'status' => $this->enumValue($rfq->status),
                'installation_location' => $rfq->installation_location,
                'due_at' => $rfq->due_at?->format('Y-m-d'),
                'customer_note' => is_string($customerNote) ? $customerNote : null,
            ],
            'project' => [
                'code' => $rfq->project->code,
                'name' => $rfq->project->name,
                'business_category' => $rfq->project->business_category,
            ],
            'customer' => [
                'name' => $rfq->customer->name,
            ],
            'technical_baseline' => [
                'snapshot_id' => (int) $snapshot->getKey(),
                'version' => (int) $snapshot->version,
                'connected_load_w' => $snapshot->connected_load_w === null ? null : (float) $snapshot->connected_load_w,
                'design_load_w' => $snapshot->design_load_w === null ? null : (float) $snapshot->design_load_w,
                'design_current_a' => $snapshot->design_current_a === null ? null : (float) $snapshot->design_current_a,
                'recommended_supply_v' => $snapshot->recommended_supply_v === null ? null : (float) $snapshot->recommended_supply_v,
                'recommended_phase' => $this->enumValue($snapshot->recommended_phase),
                'result_status' => $this->enumValue($snapshot->result_status),
                'input_hash' => $snapshot->input_hash,
            ],
            'quotation' => $quotation === null ? null : [
                'id' => (int) $quotation->getKey(),
                'number' => $quotation->number,
                'status' => $this->enumValue($quotation->status),
                'can_edit' => $quotation->status === QuotationStatus::Draft,
            ],
        ]);
    }

    public function store(
        Request $request,
        Rfq $rfq,
        CreateQuotationDraft $createQuotationDraft,
    ): RedirectResponse {
        $maker = $this->maker($request);
        $this->ensureVisibleToMaker($rfq, $maker);

        $quotation = $createQuotationDraft->handle(
            $rfq,
            $maker,
            $this->uniqueQuotationNumber(),
        );

        if ($quotation->status === QuotationStatus::Draft) {
            return redirect()->route('maker.quotations.edit', $quotation);
        }

        return redirect()->route('maker.rfqs.show', $rfq);
    }

    public function edit(Request $request, Quotation $quotation): Response
    {
        $maker = $this->maker($request);
        $this->ensureQuotationOwnedBy($quotation, $maker);

        abort_unless($quotation->status === QuotationStatus::Draft, 409);

        $quotation->load(['rfq.project', 'rfq.calculationSnapshot']);
        $revision = $this->draftRevision($quotation);
        $revision->load(['items', 'technicalDeviations']);

        return Inertia::render('maker/quotations/edit', [
            'quotation' => [
                'id' => (int) $quotation->getKey(),
                'number' => $quotation->number,
                'status' => $this->enumValue($quotation->status),
            ],
            'revision' => [
                'id' => (int) $revision->getKey(),
                'revision_number' => (int) $revision->revision_number,
                'currency_code' => $revision->currency_code,
                'fabrication_cost' => (float) $revision->fabrication_cost,
                'installation_cost' => (float) $revision->installation_cost,
                'other_cost' => (float) $revision->other_cost,
                'discount_amount' => (float) $revision->discount_amount,
                'tax_amount' => (float) $revision->tax_amount,
                'grand_total' => (float) $revision->grand_total,
                'lead_time_days' => $revision->lead_time_days,
                'warranty_months' => $revision->warranty_months,
                'notes' => $revision->notes,
                'items' => $revision->items
                    ->sortBy('sort_order')
                    ->map(fn ($item): array => [
                        'description' => $item->description,
                        'manufacturer' => $item->manufacturer,
                        'part_number' => $item->part_number,
                        'quantity' => (float) $item->quantity,
                        'unit' => $item->unit,
                        'unit_price' => (float) $item->unit_price,
                    ])
                    ->values(),
                'deviations' => $revision->technicalDeviations
                    ->map(fn ($deviation): array => [
                        'baseline_reference' => $deviation->baseline_reference,
                        'requested_specification' => $deviation->requested_specification,
                        'proposed_specification' => $deviation->proposed_specification,
                        'reason' => $deviation->reason,
                        'price_impact' => (float) $deviation->price_impact,
                        'lead_time_impact_days' => (int) $deviation->lead_time_impact_days,
                    ])
                    ->values(),
            ],
            'rfq' => [
                'id' => (int) $quotation->rfq->getKey(),
                'number' => $quotation->rfq->number,
                'title' => $quotation->rfq->title,
                'project_name' => $quotation->rfq->project->name,
            ],
        ]);
    }

    public function update(
        Request $request,
        Quotation $quotation,
        UpdateQuotationDraft $updateQuotationDraft,
    ): RedirectResponse {
        $maker = $this->maker($request);
        $this->ensureQuotationOwnedBy($quotation, $maker);

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.manufacturer' => ['nullable', 'string', 'max:120'],
            'items.*.part_number' => ['nullable', 'string', 'max:120'],
            'items.*.quantity' => ['required', 'numeric', 'gt:0'],
            'items.*.unit' => ['required', 'string', 'max:30'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'fabrication_cost' => ['required', 'numeric', 'min:0'],
            'installation_cost' => ['required', 'numeric', 'min:0'],
            'other_cost' => ['required', 'numeric', 'min:0'],
            'discount_amount' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['required', 'numeric', 'min:0'],
            'lead_time_days' => ['nullable', 'integer', 'min:0', 'max:3650'],
            'warranty_months' => ['nullable', 'integer', 'min:0', 'max:240'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'deviations' => ['array'],
            'deviations.*.baseline_reference' => ['required', 'string', 'max:255'],
            'deviations.*.requested_specification' => ['required', 'string', 'max:2000'],
            'deviations.*.proposed_specification' => ['required', 'string', 'max:2000'],
            'deviations.*.reason' => ['required', 'string', 'max:2000'],
            'deviations.*.price_impact' => ['nullable', 'numeric'],
            'deviations.*.lead_time_impact_days' => ['nullable', 'integer', 'min:-3650', 'max:3650'],
        ]);

        /** @var list<array{description:string, manufacturer?:string|null, part_number?:string|null, quantity:float|int|string, unit:string, unit_price:float|int|string}> $items */
        $items = $validated['items'];

        /** @var list<array{baseline_reference:string, requested_specification:string, proposed_specification:string, reason:string, price_impact?:float|int|string, lead_time_impact_days?:int|string}> $deviations */
        $deviations = $validated['deviations'] ?? [];

        $updateQuotationDraft->handle(
            quotation: $quotation,
            maker: $maker,
            items: $items,
            fabricationCost: (float) $validated['fabrication_cost'],
            installationCost: (float) $validated['installation_cost'],
            otherCost: (float) $validated['other_cost'],
            discountAmount: (float) $validated['discount_amount'],
            taxAmount: (float) $validated['tax_amount'],
            leadTimeDays: isset($validated['lead_time_days']) ? (int) $validated['lead_time_days'] : null,
            warrantyMonths: isset($validated['warranty_months']) ? (int) $validated['warranty_months'] : null,
            notes: isset($validated['notes']) && is_string($validated['notes']) ? $validated['notes'] : null,
            deviations: $deviations,
        );

        return redirect()
            ->route('maker.quotations.edit', $quotation)
            ->with('success', 'Quotation draft saved.');
    }

    public function submit(
        Request $request,
        Quotation $quotation,
        SubmitQuotationRevision $submitQuotationRevision,
    ): RedirectResponse {
        $maker = $this->maker($request);
        $this->ensureQuotationOwnedBy($quotation, $maker);

        $revision = $this->draftRevision($quotation);

        if (! $revision->items()->exists()) {
            return back()->withErrors([
                'items' => 'Tambahkan minimal satu item harga sebelum submit.',
            ]);
        }

        $submitQuotationRevision->handle($revision, $maker);

        return redirect()
            ->route('maker.rfqs.show', $quotation->rfq_id)
            ->with('success', 'Quotation submitted.');
    }

    private function maker(Request $request): MakerProfile
    {
        $user = $request->user();

        if (! $user instanceof User || ! $user->isMaker()) {
            abort(403);
        }

        $maker = MakerProfile::query()
            ->where('user_id', $user->getKey())
            ->where('status', 'active')
            ->first();

        if ($maker === null) {
            abort(403);
        }

        return $maker;
    }

    private function ensureVisibleToMaker(Rfq $rfq, MakerProfile $maker): void
    {
        abort_unless(
            in_array($rfq->status, [RfqStatus::Open, RfqStatus::Negotiating], true)
                && $this->isVisibleToMaker($rfq, $maker),
            404,
        );
    }

    private function isVisibleToMaker(Rfq $rfq, MakerProfile $maker): bool
    {
        $rawIds = $rfq->requirements['preferred_maker_profile_ids'] ?? [];

        if (! is_array($rawIds) || $rawIds === []) {
            return true;
        }

        $ids = array_map(
            static fn (mixed $id): int => (int) $id,
            array_filter($rawIds, static fn (mixed $id): bool => is_int($id) || is_string($id)),
        );

        return in_array((int) $maker->getKey(), $ids, true);
    }

    private function ensureQuotationOwnedBy(Quotation $quotation, MakerProfile $maker): void
    {
        abort_unless((int) $quotation->maker_profile_id === (int) $maker->getKey(), 404);
    }

    private function draftRevision(Quotation $quotation): QuotationRevision
    {
        return QuotationRevision::query()
            ->where('quotation_id', $quotation->getKey())
            ->whereNull('submitted_at')
            ->orderByDesc('revision_number')
            ->firstOrFail();
    }

    private function uniqueQuotationNumber(): string
    {
        do {
            $number = 'QUO-ARU-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (Quotation::query()->where('number', $number)->exists());

        return $number;
    }

    private function enumValue(mixed $value): mixed
    {
        return $value instanceof \BackedEnum ? $value->value : $value;
    }
}
