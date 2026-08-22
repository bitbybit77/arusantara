<?php

namespace App\Http\Controllers\Procurement;

use App\Actions\Procurement\CreateRfqFromCalculationSnapshot;
use App\Actions\Procurement\PublishRfq;
use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\StoreRfqRequest;
use App\Models\Configuration\Project;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\Rfq;
use App\Models\User;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RfqController extends Controller
{
    public function create(Request $request, Project $project): Response
    {
        $customer = $this->customer($request);
        $this->ensureProjectOwnedBy($project, $customer);

        $snapshot = $this->latestFinalizedSnapshot($project);

        $makers = MakerProfile::query()
            ->with('user:id,name')
            ->where('status', 'active')
            ->orderBy('business_name')
            ->get()
            ->map(fn (MakerProfile $maker): array => [
                'id' => (int) $maker->getKey(),
                'business_name' => $maker->business_name,
                'description' => $maker->description,
                'city' => $maker->city,
                'service_area' => $maker->service_area ?? [],
                'verification_status' => $this->enumValue($maker->verification_status),
                'contact_name' => $maker->user?->name,
            ])
            ->values();

        return Inertia::render('rfqs/create', [
            'project' => [
                'id' => (int) $project->getKey(),
                'code' => $project->code,
                'name' => $project->name,
                'business_category' => $project->business_category,
            ],
            'snapshot' => [
                'id' => (int) $snapshot->getKey(),
                'version' => (int) $snapshot->version,
                'connected_load_w' => $snapshot->connected_load_w === null ? null : (float) $snapshot->connected_load_w,
                'design_load_w' => $snapshot->design_load_w === null ? null : (float) $snapshot->design_load_w,
                'design_current_a' => $snapshot->design_current_a === null ? null : (float) $snapshot->design_current_a,
                'recommended_supply_v' => $snapshot->recommended_supply_v === null ? null : (float) $snapshot->recommended_supply_v,
                'recommended_phase' => $this->enumValue($snapshot->recommended_phase),
                'result_status' => $this->enumValue($snapshot->result_status),
            ],
            'makers' => $makers,
        ]);
    }

    public function store(
        StoreRfqRequest $request,
        Project $project,
        CreateRfqFromCalculationSnapshot $createRfq,
    ): RedirectResponse {
        $customer = $this->customer($request);
        $this->ensureProjectOwnedBy($project, $customer);

        $snapshot = $this->latestFinalizedSnapshot($project);
        $validated = $request->validated();

        $preferredMakerIds = $this->normalizeMakerIds($validated['preferred_maker_profile_ids'] ?? []);

        $requirements = [
            'preferred_maker_profile_ids' => $preferredMakerIds,
            'customer_note' => $validated['customer_note'] ?? null,
            'engineering_snapshot_version' => (int) $snapshot->version,
        ];

        $dueAt = isset($validated['due_at']) && is_string($validated['due_at'])
            ? Carbon::parse($validated['due_at'])->endOfDay()
            : null;

        $rfq = $createRfq->handle(
            calculationSnapshot: $snapshot,
            customer: $customer,
            number: $this->uniqueRfqNumber(),
            title: (string) $validated['title'],
            requirements: $requirements,
            installationLocation: isset($validated['installation_location'])
                ? (string) $validated['installation_location']
                : null,
            dueAt: $dueAt,
        );

        return redirect()->route('rfqs.show', $rfq);
    }

    public function show(Request $request, Rfq $rfq): Response
    {
        $customer = $this->customer($request);
        $this->ensureRfqOwnedBy($rfq, $customer);

        $rfq->load(['project', 'calculationSnapshot']);

        $preferredMakerIds = $this->preferredMakerIds($rfq);
        $preferredMakers = MakerProfile::query()
            ->whereIn('id', $preferredMakerIds)
            ->orderBy('business_name')
            ->get()
            ->map(fn (MakerProfile $maker): array => [
                'id' => (int) $maker->getKey(),
                'business_name' => $maker->business_name,
                'city' => $maker->city,
                'verification_status' => $this->enumValue($maker->verification_status),
            ])
            ->values();

        $snapshot = $rfq->calculationSnapshot;
        $requirements = $rfq->requirements;
        $customerNote = $requirements['customer_note'] ?? null;

        $quotations = Quotation::query()
            ->with([
                'maker:id,business_name,city',
                'currentRevision:id,quotation_id,revision_number,grand_total,lead_time_days,submitted_at',
            ])
            ->where('rfq_id', $rfq->getKey())
            ->where('status', '!=', QuotationStatus::Draft->value)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Quotation $quotation): array => [
                'id' => (int) $quotation->getKey(),
                'number' => $quotation->number,
                'status' => $this->enumValue($quotation->status),
                'maker' => [
                    'business_name' => $quotation->maker->business_name,
                    'city' => $quotation->maker->city,
                ],
                'revision' => $quotation->currentRevision === null ? null : [
                    'revision_number' => (int) $quotation->currentRevision->revision_number,
                    'grand_total' => (float) $quotation->currentRevision->grand_total,
                    'lead_time_days' => $quotation->currentRevision->lead_time_days,
                ],
            ])
            ->values();

        return Inertia::render('rfqs/show', [
            'rfq' => [
                'id' => (int) $rfq->getKey(),
                'number' => $rfq->number,
                'title' => $rfq->title,
                'status' => $this->enumValue($rfq->status),
                'installation_location' => $rfq->installation_location,
                'due_at' => $rfq->due_at?->format('Y-m-d'),
                'published_at' => $rfq->published_at?->toIso8601String(),
                'customer_note' => is_string($customerNote) ? $customerNote : null,
                'can_publish' => $rfq->status === RfqStatus::Draft,
            ],
            'project' => [
                'id' => (int) $rfq->project->getKey(),
                'code' => $rfq->project->code,
                'name' => $rfq->project->name,
                'business_category' => $rfq->project->business_category,
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
            'preferred_makers' => $preferredMakers,
            'quotations' => $quotations,
        ]);
    }

    public function publish(Request $request, Rfq $rfq, PublishRfq $publishRfq): RedirectResponse
    {
        $customer = $this->customer($request);
        $this->ensureRfqOwnedBy($rfq, $customer);

        $publishRfq->handle($rfq, $customer);

        return redirect()->route('rfqs.show', $rfq);
    }

    private function latestFinalizedSnapshot(Project $project): CalculationSnapshot
    {
        $configuration = $project->configurations()
            ->orderByDesc('version')
            ->firstOrFail();

        $snapshot = $configuration->calculationSnapshots()
            ->orderByDesc('version')
            ->firstOrFail();

        $snapshot->ensureFinalized();

        return $snapshot;
    }

    private function customer(Request $request): User
    {
        $customer = $request->user();

        if (! $customer instanceof User || ! $customer->isCustomer()) {
            abort(403);
        }

        return $customer;
    }

    private function ensureProjectOwnedBy(Project $project, User $customer): void
    {
        abort_unless((int) $project->customer_id === (int) $customer->getKey(), 404);
    }

    private function ensureRfqOwnedBy(Rfq $rfq, User $customer): void
    {
        abort_unless((int) $rfq->customer_id === (int) $customer->getKey(), 404);
    }

    /** @return list<int> */
    private function preferredMakerIds(Rfq $rfq): array
    {
        $rawIds = $rfq->requirements['preferred_maker_profile_ids'] ?? [];

        if (! is_array($rawIds)) {
            return [];
        }

        return $this->normalizeMakerIds($rawIds);
    }

    /** @return list<int> */
    private function normalizeMakerIds(mixed $rawIds): array
    {
        if (! is_array($rawIds)) {
            return [];
        }

        $ids = [];

        foreach ($rawIds as $id) {
            if (is_int($id) || is_string($id)) {
                $ids[] = (int) $id;
            }
        }

        return $ids;
    }

    private function uniqueRfqNumber(): string
    {
        do {
            $number = 'RFQ-ARU-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (Rfq::query()->where('number', $number)->exists());

        return $number;
    }

    private function enumValue(mixed $value): mixed
    {
        return $value instanceof \BackedEnum ? $value->value : $value;
    }
}
