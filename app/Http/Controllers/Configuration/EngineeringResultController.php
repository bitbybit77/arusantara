<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Models\Configuration\Project;
use DateTimeInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EngineeringResultController extends Controller
{
    public function __invoke(Request $request, Project $project): Response
    {
        abort_unless((int) $project->customer_id === (int) $request->user()->getKey(), 404);

        $configuration = $project->configurations()
            ->orderByDesc('version')
            ->firstOrFail();

        $snapshot = $configuration->calculationSnapshots()
            ->with(['lines' => fn ($query) => $query->orderBy('sort_order')])
            ->orderByDesc('version')
            ->firstOrFail();

        $calculatedAt = $snapshot->getAttribute('calculated_at');

        return Inertia::render('engineering/show', [
            'project' => [
                'id' => (int) $project->getKey(),
                'code' => $project->code,
                'name' => $project->name,
                'business_category' => $project->business_category,
            ],
            'result' => [
                'version' => (int) $snapshot->version,
                'calculator_version' => $snapshot->calculator_version,
                'connected_load_w' => $snapshot->connected_load_w === null ? null : (float) $snapshot->connected_load_w,
                'design_load_w' => $snapshot->design_load_w === null ? null : (float) $snapshot->design_load_w,
                'design_current_a' => $snapshot->design_current_a === null ? null : (float) $snapshot->design_current_a,
                'recommended_supply_v' => $snapshot->recommended_supply_v === null ? null : (float) $snapshot->recommended_supply_v,
                'recommended_phase' => $this->enumValue($snapshot->recommended_phase),
                'result_status' => $this->enumValue($snapshot->result_status),
                'assumptions' => $snapshot->assumptions ?? [],
                'warnings' => $snapshot->warnings ?? [],
                'input_hash' => $snapshot->input_hash,
                'calculated_at' => $calculatedAt instanceof DateTimeInterface
                    ? $calculatedAt->format(DateTimeInterface::ATOM)
                    : (is_string($calculatedAt) ? $calculatedAt : null),
                'lines' => $snapshot->lines->map(fn ($line): array => [
                    'description' => $line->description,
                    'quantity' => (float) $line->quantity,
                    'rated_power_w' => $line->rated_power_w === null ? null : (float) $line->rated_power_w,
                    'design_power_w' => $line->design_power_w === null ? null : (float) $line->design_power_w,
                    'design_current_a' => $line->design_current_a === null ? null : (float) $line->design_current_a,
                    'phase' => $this->enumValue($line->phase),
                    'result_status' => $this->enumValue($line->result_status),
                    'calculation_detail' => $line->calculation_detail ?? [],
                ])->values(),
            ],
        ]);
    }

    private function enumValue(mixed $value): mixed
    {
        return $value instanceof \BackedEnum ? $value->value : $value;
    }
}
