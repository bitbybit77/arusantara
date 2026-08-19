<?php

namespace App\Actions\Procurement;

use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Procurement\Rfq;
use App\Models\User;
use App\Procurement\RfqStatus;
use DateTimeInterface;
use DomainException;
use Illuminate\Support\Facades\DB;

class CreateRfqFromCalculationSnapshot
{
    /**
     * @param  array<string, mixed>  $requirements
     */
    public function handle(
        CalculationSnapshot $calculationSnapshot,
        User $customer,
        string $number,
        string $title,
        array $requirements = [],
        ?string $installationLocation = null,
        ?DateTimeInterface $dueAt = null,
    ): Rfq {
        return DB::transaction(function () use (
            $calculationSnapshot,
            $customer,
            $number,
            $title,
            $requirements,
            $installationLocation,
            $dueAt,
        ): Rfq {
            $lockedSnapshot = CalculationSnapshot::query()
                ->whereKey($calculationSnapshot->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $lockedSnapshot->ensureFinalized();

            $projectConfiguration = ProjectConfiguration::query()
                ->whereKey($lockedSnapshot->project_configuration_id)
                ->lockForUpdate()
                ->firstOrFail();

            $project = Project::query()
                ->whereKey($projectConfiguration->project_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ((int) $project->customer_id !== (int) $customer->getKey()) {
                throw new DomainException('The calculation snapshot does not belong to this customer.');
            }

            return Rfq::query()->create([
                'project_id' => $project->getKey(),
                'calculation_snapshot_id' => $lockedSnapshot->getKey(),
                'customer_id' => $customer->getKey(),
                'number' => $number,
                'title' => $title,
                'status' => RfqStatus::Draft,
                'requirements' => $requirements,
                'installation_location' => $installationLocation,
                'due_at' => $dueAt,
            ]);
        }, 3);
    }
}
