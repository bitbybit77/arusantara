<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\UpdateProjectConfigurationRequest;
use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Equipment\EquipmentCategory;
use App\Models\Equipment\EquipmentModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectConfigurationController extends Controller
{
    public function edit(Request $request, Project $project): Response|RedirectResponse
    {
        $this->ensureOwnedBy($request, $project);

        $configuration = $this->latestConfiguration($project);

        if ($configuration->isReadOnly()) {
            if ($configuration->calculationSnapshots()->exists()) {
                return redirect()->route('projects.engineering.show', $project);
            }

            return redirect()->route('projects.show', $project);
        }

        $configuration->load(['lines' => fn ($query) => $query->orderBy('sort_order')]);

        $categories = EquipmentCategory::query()
            ->where('status', 'active')
            ->whereHas('equipmentModels', fn ($query) => $query->where('status', 'active'))
            ->with(['equipmentModels' => fn ($query) => $query
                ->where('status', 'active')
                ->with('sources')
                ->orderBy('brand')
                ->orderBy('model')])
            ->orderBy('name')
            ->get()
            ->map(fn (EquipmentCategory $category): array => [
                'id' => (int) $category->getKey(),
                'code' => $category->code,
                'name' => $category->name,
                'models' => $category->equipmentModels->map(fn (EquipmentModel $model): array => [
                    'id' => (int) $model->getKey(),
                    'brand' => $model->brand,
                    'model' => $model->model,
                    'equipment_type' => $model->equipment_type,
                    'specification_variant' => $model->specification_variant,
                    'rated_power_w' => $model->rated_power_w === null ? null : (float) $model->rated_power_w,
                    'voltage_v' => $model->voltage_v === null ? null : (float) $model->voltage_v,
                    'phase' => $this->enumValue($model->phase),
                    'confidence' => $this->enumValue($model->specification_confidence),
                    'source_count' => $model->sources->count(),
                ])->values()->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('configurations/edit', [
            'project' => [
                'id' => (int) $project->getKey(),
                'code' => $project->code,
                'name' => $project->name,
                'business_category' => $project->business_category,
            ],
            'configuration' => [
                'version' => (int) $configuration->version,
                'status' => $this->enumValue($configuration->status),
                'lines' => $configuration->lines->map(fn ($line): array => [
                    'equipment_model_id' => $line->equipment_model_id === null ? null : (int) $line->equipment_model_id,
                    'quantity' => (int) $line->quantity,
                    'equipment_status' => $this->enumValue($line->equipment_status),
                    'simultaneous_use' => (bool) data_get($line->usage_profile, 'simultaneous_use', true),
                ])->values(),
            ],
            'catalog' => $categories,
        ]);
    }

    public function update(UpdateProjectConfigurationRequest $request, Project $project): RedirectResponse
    {
        $this->ensureOwnedBy($request, $project);

        DB::transaction(function () use ($request, $project): void {
            $configuration = ProjectConfiguration::query()
                ->where('project_id', $project->getKey())
                ->orderByDesc('version')
                ->lockForUpdate()
                ->firstOrFail();

            abort_if($configuration->isReadOnly(), 409, 'This configuration is already locked.');

            /** @var list<array{equipment_model_id: int, quantity: int, equipment_status: string, simultaneous_use: bool}> $items */
            $items = $request->validated('items');
            $modelIds = array_map(
                static fn (array $item): int => (int) $item['equipment_model_id'],
                $items,
            );

            $models = EquipmentModel::query()
                ->whereIn('id', $modelIds)
                ->where('status', 'active')
                ->get()
                ->keyBy('id');

            abort_unless($models->count() === count($items), 422, 'One or more equipment models are unavailable.');

            $configuration->lines()->delete();

            foreach ($items as $index => $item) {
                /** @var EquipmentModel $model */
                $model = $models->get((int) $item['equipment_model_id']);

                $configuration->lines()->create([
                    'equipment_category_id' => $model->equipment_category_id,
                    'equipment_model_id' => $model->getKey(),
                    'label' => trim("{$model->brand} {$model->model}"),
                    'quantity' => (int) $item['quantity'],
                    'equipment_status' => $item['equipment_status'],
                    'usage_profile' => [
                        'simultaneous_use' => (bool) $item['simultaneous_use'],
                    ],
                    'sort_order' => $index,
                ]);
            }
        }, 3);

        return redirect()->route('projects.configuration.edit', $project);
    }

    private function latestConfiguration(Project $project): ProjectConfiguration
    {
        return $project->configurations()
            ->orderByDesc('version')
            ->firstOrFail();
    }

    private function ensureOwnedBy(Request $request, Project $project): void
    {
        abort_unless((int) $project->customer_id === (int) $request->user()->getKey(), 404);
    }

    private function enumValue(mixed $value): mixed
    {
        return $value instanceof \BackedEnum ? $value->value : $value;
    }
}
