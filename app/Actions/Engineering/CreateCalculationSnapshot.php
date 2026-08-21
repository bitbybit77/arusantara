<?php

namespace App\Actions\Engineering;

use App\Configuration\ConfigurationStatus;
use App\Engineering\EngineeringResultStatus;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationSnapshot;
use DomainException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class CreateCalculationSnapshot
{
    /** @var list<string> */
    private const SNAPSHOT_ATTRIBUTES = [
        'calculator_version',
        'connected_load_w',
        'design_load_w',
        'design_current_a',
        'recommended_supply_v',
        'recommended_phase',
        'result_status',
        'result_payload',
        'assumptions',
        'warnings',
        'calculated_by_user_id',
        'calculated_at',
    ];

    /** @var list<string> */
    private const CALCULATION_LINE_ATTRIBUTES = [
        'source_configuration_line_id',
        'line_code',
        'line_type',
        'description',
        'quantity',
        'rated_power_w',
        'design_power_w',
        'design_current_a',
        'phase',
        'circuit_group',
        'recommended_protection',
        'recommended_rating_a',
        'result_status',
        'education_reference',
        'calculation_detail',
        'sort_order',
    ];

    /**
     * @param  array<string, mixed>  $snapshotAttributes
     * @param  list<array<string, mixed>>  $calculationLines
     */
    public function handle(
        ProjectConfiguration $projectConfiguration,
        array $snapshotAttributes,
        array $calculationLines = [],
    ): CalculationSnapshot {
        return DB::transaction(function () use (
            $projectConfiguration,
            $snapshotAttributes,
            $calculationLines,
        ): CalculationSnapshot {
            $lockedConfiguration = ProjectConfiguration::query()
                ->whereKey($projectConfiguration->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ((string) $lockedConfiguration->getRawOriginal('status') !== ConfigurationStatus::Locked->value) {
                throw new DomainException('Calculation snapshots may only be created from locked project configurations.');
            }

            $nextVersion = ((int) CalculationSnapshot::query()
                ->where('project_configuration_id', $lockedConfiguration->getKey())
                ->max('version')) + 1;

            $snapshot = $lockedConfiguration->calculationSnapshots()->create(array_replace(
                [
                    'calculator_version' => 'preliminary-v1',
                    'result_status' => EngineeringResultStatus::RequiresVerification,
                    'result_payload' => [],
                    'assumptions' => [],
                    'warnings' => [],
                    'calculated_by_user_id' => null,
                    'calculated_at' => now(),
                ],
                Arr::only($snapshotAttributes, self::SNAPSHOT_ATTRIBUTES),
                [
                    'version' => $nextVersion,
                ],
            ));

            foreach ($calculationLines as $calculationLine) {
                $snapshot->lines()->create(Arr::only(
                    $calculationLine,
                    self::CALCULATION_LINE_ATTRIBUTES,
                ));
            }

            $snapshot->finalize();

            return $snapshot->refresh()->load('lines');
        }, 3);
    }
}
