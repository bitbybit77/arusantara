<?php

namespace App\Actions\Engineering;

use App\Configuration\ConfigurationStatus;
use App\Engineering\EngineeringResultStatus;
use App\Models\Configuration\ConfigurationLine;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationSnapshot;
use BackedEnum;
use DateTimeInterface;
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

            if ($lockedConfiguration->status !== ConfigurationStatus::Locked) {
                throw new DomainException('Calculation snapshots may only be created from locked project configurations.');
            }

            $frozenLines = ConfigurationLine::query()
                ->where('project_configuration_id', $lockedConfiguration->getKey())
                ->orderBy('sort_order')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

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
                    'input_payload' => $this->inputPayload($lockedConfiguration, $frozenLines->all()),
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

    /**
     * @param  list<ConfigurationLine>  $configurationLines
     * @return array<string, mixed>
     */
    private function inputPayload(
        ProjectConfiguration $projectConfiguration,
        array $configurationLines,
    ): array {
        return [
            'schema_version' => 1,
            'project_configuration' => [
                'id' => (int) $projectConfiguration->getKey(),
                'project_id' => (int) $projectConfiguration->project_id,
                'version' => (int) $projectConfiguration->version,
                'status' => $this->enumValue($projectConfiguration->status),
                'locked_at' => $this->dateTimeValue($projectConfiguration->locked_at),
            ],
            'configuration_lines' => array_map(fn (ConfigurationLine $line): array => [
                'id' => (int) $line->getKey(),
                'equipment_category_id' => (int) $line->equipment_category_id,
                'equipment_model_id' => $line->equipment_model_id === null
                    ? null
                    : (int) $line->equipment_model_id,
                'label' => $line->label,
                'quantity' => (int) $line->quantity,
                'equipment_status' => $this->enumValue($line->equipment_status),
                'usage_profile' => $line->usage_profile,
                'customer_parameters' => $line->customer_parameters,
                'equipment_snapshot' => $line->equipment_snapshot,
                'specification_basis' => $this->enumValue($line->specification_basis),
                'specification_confidence' => $this->enumValue($line->specification_confidence),
                'notes' => $line->notes,
                'sort_order' => (int) $line->sort_order,
            ], $configurationLines),
        ];
    }

    private function enumValue(BackedEnum|string|null $value): ?string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }

    private function dateTimeValue(mixed $value): ?string
    {
        if ($value instanceof DateTimeInterface) {
            return $value->format(DateTimeInterface::ATOM);
        }

        return is_string($value) ? $value : null;
    }
}
