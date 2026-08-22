<?php

namespace App\Http\Controllers\Configuration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\StoreProjectRequest;
use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = Project::query()
            ->where('customer_id', $request->user()->getKey())
            ->with(['configurations' => fn ($query) => $query
                ->withCount('lines')
                ->orderByDesc('version')])
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (Project $project): array {
                /** @var ProjectConfiguration|null $configuration */
                $configuration = $project->configurations->first();

                return [
                    'id' => (int) $project->getKey(),
                    'code' => $project->code,
                    'name' => $project->name,
                    'description' => $project->description,
                    'business_category' => $project->business_category,
                    'status' => $this->enumValue($project->status),
                    'updated_at' => $project->updated_at?->toIso8601String(),
                    'configuration' => $configuration === null ? null : [
                        'version' => (int) $configuration->version,
                        'status' => $this->enumValue($configuration->status),
                        'lines_count' => (int) $configuration->lines_count,
                    ],
                ];
            });

        return Inertia::render('projects/index', [
            'projects' => $projects,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('projects/create');
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = DB::transaction(function () use ($request): Project {
            $project = Project::query()->create([
                'customer_id' => $request->user()->getKey(),
                'code' => $this->uniqueProjectCode(),
                'name' => $request->string('name')->toString(),
                'description' => $request->input('description'),
                'business_category' => $request->string('business_category')->toString(),
            ]);

            $project->configurations()->create([
                'version' => 1,
                'created_by_user_id' => $request->user()->getKey(),
            ]);

            return $project;
        }, 3);

        return redirect()->route('projects.configuration.edit', $project);
    }

    public function show(Request $request, Project $project): Response
    {
        $this->ensureOwnedBy($request, $project);

        $configuration = $project->configurations()
            ->withCount('lines')
            ->with(['calculationSnapshots' => fn ($query) => $query->orderByDesc('version')])
            ->orderByDesc('version')
            ->first();

        return Inertia::render('projects/show', [
            'project' => [
                'id' => (int) $project->getKey(),
                'code' => $project->code,
                'name' => $project->name,
                'description' => $project->description,
                'business_category' => $project->business_category,
                'status' => $this->enumValue($project->status),
            ],
            'configuration' => $configuration === null ? null : [
                'version' => (int) $configuration->version,
                'status' => $this->enumValue($configuration->status),
                'lines_count' => (int) $configuration->lines_count,
                'has_result' => $configuration->calculationSnapshots->isNotEmpty(),
            ],
        ]);
    }

    private function ensureOwnedBy(Request $request, Project $project): void
    {
        abort_unless((int) $project->customer_id === (int) $request->user()->getKey(), 404);
    }

    private function uniqueProjectCode(): string
    {
        do {
            $code = 'PRJ-'.Str::upper(Str::random(8));
        } while (Project::query()->where('code', $code)->exists());

        return $code;
    }

    private function enumValue(mixed $value): mixed
    {
        return $value instanceof \BackedEnum ? $value->value : $value;
    }
}
