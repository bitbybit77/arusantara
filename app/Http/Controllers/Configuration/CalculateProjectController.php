<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Engineering\CalculateProjectConfiguration;
use App\Configuration\ConfigurationStatus;
use App\Http\Controllers\Controller;
use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CalculateProjectController extends Controller
{
    public function __invoke(
        Request $request,
        Project $project,
        CalculateProjectConfiguration $calculateProjectConfiguration,
    ): RedirectResponse {
        abort_unless((int) $project->customer_id === (int) $request->user()->getKey(), 404);

        DB::transaction(function () use ($project, $request, $calculateProjectConfiguration): void {
            $configuration = ProjectConfiguration::query()
                ->where('project_id', $project->getKey())
                ->orderByDesc('version')
                ->lockForUpdate()
                ->firstOrFail();

            if ($configuration->isReadOnly()) {
                return;
            }

            abort_if(! $configuration->lines()->exists(), 422, 'Add at least one equipment item before calculation.');

            $configuration->setAttribute('status', ConfigurationStatus::Locked);
            $configuration->save();

            $calculateProjectConfiguration->handle(
                $configuration,
                (int) $request->user()->getKey(),
            );
        }, 3);

        return redirect()->route('projects.engineering.show', $project);
    }
}
