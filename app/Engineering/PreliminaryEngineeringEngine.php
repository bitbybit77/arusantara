<?php

namespace App\Engineering;

use App\Equipment\ElectricalPhase;
use InvalidArgumentException;

final class PreliminaryEngineeringEngine
{
    public const VERSION = 'preliminary-v1';

    /**
     * V1 deliberately stops before final protection sizing, cable sizing,
     * voltage-drop, short-circuit, earthing, and coordination studies.
     *
     * @param  array<string, mixed>  $inputPayload
     */
    public function calculate(array $inputPayload): PreliminaryEngineeringResult
    {
        $configurationLines = $inputPayload['configuration_lines'] ?? null;

        if (! is_array($configurationLines)) {
            throw new InvalidArgumentException('Engineering input payload must contain configuration_lines.');
        }

        $connectedLoadW = 0.0;
        $designLoadW = 0.0;
        $assumptions = [];
        $warnings = [];
        $calculationLines = [];
        $lineStatuses = [];
        $supplyCandidates = [];

        foreach (array_values($configurationLines) as $index => $rawLine) {
            if (! is_array($rawLine)) {
                $warnings[] = $this->warning(
                    'invalid_configuration_line',
                    null,
                    'A configuration line could not be interpreted by the preliminary engine.',
                );
                $lineStatuses[] = EngineeringResultStatus::RequiresVerification;

                continue;
            }

            /** @var array<string, mixed> $line */
            $line = $rawLine;
            $lineResult = $this->calculateLine($line, $index + 1);

            $connectedLoadW += $lineResult['connected_load_w'];
            $designLoadW += $lineResult['design_load_w'];
            $assumptions = [...$assumptions, ...$lineResult['assumptions']];
            $warnings = [...$warnings, ...$lineResult['warnings']];
            $calculationLines[] = $lineResult['calculation_line'];
            $lineStatuses[] = $lineResult['status'];
            $supplyCandidates[] = $lineResult['supply_candidate'];
        }

        $aggregate = $this->calculateAggregateSupply($supplyCandidates, $designLoadW);
        $warnings = [...$warnings, ...$aggregate['warnings']];
        $lineStatuses[] = $aggregate['status'];

        $resultStatus = $this->mostSevereStatus($lineStatuses);

        return new PreliminaryEngineeringResult(
            calculatorVersion: self::VERSION,
            connectedLoadW: $this->roundEngineeringValue($connectedLoadW),
            designLoadW: $this->roundEngineeringValue($designLoadW),
            designCurrentA: $aggregate['design_current_a'],
            recommendedSupplyV: $aggregate['recommended_supply_v'],
            recommendedPhase: $aggregate['recommended_phase'],
            resultStatus: $resultStatus,
            assumptions: $assumptions,
            warnings: $warnings,
            rulesApplied: [
                'connected_load.quantity_times_rated_input_power.v1',
                'demand.explicit_or_conservative_full_demand.v1',
                'current.active_power_voltage_power_factor.v1',
                'supply.compatibility_only_no_service_upgrade_threshold.v1',
            ],
            calculationLines: $calculationLines,
        );
    }

    /**
     * @param  array<string, mixed>  $line
     * @return array{
     *     connected_load_w: float,
     *     design_load_w: float,
     *     assumptions: list<array<string, mixed>>,
     *     warnings: list<array<string, mixed>>,
     *     calculation_line: array<string, mixed>,
     *     status: EngineeringResultStatus,
     *     supply_candidate: array{
     *         phase: ElectricalPhase|null,
     *         voltage_v: float|null,
     *         power_factor: float|null,
     *         design_power_w: float,
     *         current_a: float|null,
     *         valid_for_load: bool
     *     }
     * }
     */
    private function calculateLine(array $line, int $position): array
    {
        $lineId = $this->nullableInteger($line['id'] ?? null);
        $label = $this->nonEmptyString($line['label'] ?? null) ?? "Configuration line {$position}";
        $quantity = $this->positiveNumber($line['quantity'] ?? null);
        $rawSnapshot = $line['equipment_snapshot'] ?? null;
        $snapshot = is_array($rawSnapshot) ? $rawSnapshot : [];
        $rawTechnical = $snapshot['technical'] ?? null;
        $technical = is_array($rawTechnical) ? $rawTechnical : $snapshot;

        $ratedPowerW = $this->positiveNumber($technical['rated_power_w'] ?? $snapshot['rated_power_w'] ?? null);
        $voltageV = $this->positiveNumber($technical['voltage_v'] ?? $snapshot['voltage_v'] ?? null);
        $powerFactor = $this->powerFactor($technical['power_factor'] ?? $snapshot['power_factor'] ?? null);
        $phase = $this->phase($technical['phase'] ?? $snapshot['phase'] ?? null);
        $specificationBasis = $this->nonEmptyString($line['specification_basis'] ?? null);

        $assumptions = [];
        $warnings = [];
        $status = $specificationBasis === 'exact'
            ? EngineeringResultStatus::Calculated
            : EngineeringResultStatus::Estimated;

        if ($quantity === null) {
            $quantity = 0.0;
            $status = EngineeringResultStatus::RequiresVerification;
            $warnings[] = $this->warning(
                'invalid_quantity',
                $lineId,
                "{$label} does not have a valid positive quantity.",
            );
        }

        if ($ratedPowerW === null) {
            $status = EngineeringResultStatus::RequiresVerification;
            $warnings[] = $this->warning(
                'missing_rated_power',
                $lineId,
                "{$label} is missing a usable rated input power, so its load cannot be calculated.",
            );
        }

        $connectedLoadW = $ratedPowerW === null
            ? 0.0
            : $quantity * $ratedPowerW;

        $demand = $this->resolveDemandFactor($line, $lineId, $label);
        $assumptions = [...$assumptions, ...$demand['assumptions']];
        $warnings = [...$warnings, ...$demand['warnings']];
        $status = $this->mostSevereStatus([$status, $demand['status']]);

        $designLoadW = $connectedLoadW * $demand['factor'];
        $designCurrentA = null;

        if ($designLoadW > 0.0) {
            if ($voltageV === null) {
                $status = EngineeringResultStatus::RequiresVerification;
                $warnings[] = $this->warning(
                    'missing_voltage',
                    $lineId,
                    "{$label} is missing a usable voltage, so design current cannot be calculated.",
                );
            }

            if ($phase === null) {
                $status = EngineeringResultStatus::RequiresVerification;
                $warnings[] = $this->warning(
                    'missing_phase',
                    $lineId,
                    "{$label} is missing phase information, so design current cannot be calculated.",
                );
            }

            if ($powerFactor === null) {
                $status = EngineeringResultStatus::RequiresVerification;
                $warnings[] = $this->warning(
                    'missing_power_factor',
                    $lineId,
                    "{$label} is missing a usable power factor, so design current cannot be calculated without inventing an assumption.",
                );
            }

            if ($voltageV !== null && $phase !== null && $powerFactor !== null) {
                $designCurrentA = $this->calculateCurrent(
                    designPowerW: $designLoadW,
                    voltageV: $voltageV,
                    phase: $phase,
                    powerFactor: $powerFactor,
                );
            }
        }

        $lineCode = 'LOAD-'.str_pad((string) $position, 3, '0', STR_PAD_LEFT);

        return [
            'connected_load_w' => $connectedLoadW,
            'design_load_w' => $designLoadW,
            'assumptions' => $assumptions,
            'warnings' => $warnings,
            'status' => $status,
            'calculation_line' => [
                'source_configuration_line_id' => $lineId,
                'line_code' => $lineCode,
                'line_type' => CalculationLineType::Load,
                'description' => $label,
                'quantity' => $quantity,
                'rated_power_w' => $ratedPowerW,
                'design_power_w' => $this->roundEngineeringValue($designLoadW),
                'design_current_a' => $designCurrentA,
                'phase' => $phase,
                'result_status' => $status,
                'calculation_detail' => [
                    'connected_load_w' => $this->roundEngineeringValue($connectedLoadW),
                    'demand_factor' => $demand['factor'],
                    'demand_factor_source' => $demand['source'],
                    'voltage_v' => $voltageV,
                    'power_factor' => $powerFactor,
                    'rated_power_semantics' => 'electrical_input_power',
                    'current_formula' => $phase === null
                        ? null
                        : ($phase === ElectricalPhase::ThreePhase
                            ? 'I = P / (sqrt(3) * V * PF)'
                            : 'I = P / (V * PF)'),
                ],
                'sort_order' => $position,
            ],
            'supply_candidate' => [
                'phase' => $phase,
                'voltage_v' => $voltageV,
                'power_factor' => $powerFactor,
                'design_power_w' => $designLoadW,
                'current_a' => $designCurrentA,
                'valid_for_load' => $ratedPowerW !== null && $quantity > 0.0,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $line
     * @return array{
     *     factor: float,
     *     source: string,
     *     status: EngineeringResultStatus,
     *     assumptions: list<array<string, mixed>>,
     *     warnings: list<array<string, mixed>>
     * }
     */
    private function resolveDemandFactor(array $line, ?int $lineId, string $label): array
    {
        $rawUsageProfile = $line['usage_profile'] ?? null;
        $usageProfile = is_array($rawUsageProfile) ? $rawUsageProfile : [];

        $rawFactor = $usageProfile['demand_factor'] ?? null;

        if ($rawFactor !== null) {
            $factor = $this->boundedFactor($rawFactor);

            if ($factor !== null) {
                return [
                    'factor' => $factor,
                    'source' => 'usage_profile.demand_factor',
                    'status' => $factor < 1.0
                        ? EngineeringResultStatus::Assumed
                        : EngineeringResultStatus::Calculated,
                    'assumptions' => [[
                        'code' => 'explicit_demand_factor',
                        'configuration_line_id' => $lineId,
                        'value' => $factor,
                        'message' => "{$label} uses the normalized demand factor stored in its usage profile.",
                    ]],
                    'warnings' => [],
                ];
            }

            return [
                'factor' => 1.0,
                'source' => 'conservative_full_demand_fallback',
                'status' => EngineeringResultStatus::RequiresVerification,
                'assumptions' => [[
                    'code' => 'full_demand_fallback',
                    'configuration_line_id' => $lineId,
                    'value' => 1.0,
                    'message' => "{$label} is conservatively treated at 100% demand until its usage rule is verified.",
                ]],
                'warnings' => [$this->warning(
                    'invalid_demand_factor',
                    $lineId,
                    "{$label} contains an invalid demand factor. V1 used 100% demand instead.",
                )],
            ];
        }

        if (($usageProfile['simultaneous_use'] ?? null) === true) {
            return [
                'factor' => 1.0,
                'source' => 'usage_profile.simultaneous_use',
                'status' => EngineeringResultStatus::Calculated,
                'assumptions' => [],
                'warnings' => [],
            ];
        }

        return [
            'factor' => 1.0,
            'source' => 'conservative_full_demand_default',
            'status' => EngineeringResultStatus::Assumed,
            'assumptions' => [[
                'code' => 'conservative_full_demand',
                'configuration_line_id' => $lineId,
                'value' => 1.0,
                'message' => "{$label} uses 100% demand because no verified demand-reduction rule is available in V1.",
            ]],
            'warnings' => [],
        ];
    }

    /**
     * @param  list<array{
     *     phase: ElectricalPhase|null,
     *     voltage_v: float|null,
     *     power_factor: float|null,
     *     design_power_w: float,
     *     current_a: float|null,
     *     valid_for_load: bool
     * }>  $candidates
     * @return array{
     *     design_current_a: float|null,
     *     recommended_supply_v: float|null,
     *     recommended_phase: ElectricalPhase|null,
     *     status: EngineeringResultStatus,
     *     warnings: list<array<string, mixed>>
     * }
     */
    private function calculateAggregateSupply(array $candidates, float $designLoadW): array
    {
        $activeCandidates = array_values(array_filter(
            $candidates,
            static fn (array $candidate): bool => $candidate['valid_for_load'],
        ));

        if ($activeCandidates === [] || $designLoadW <= 0.0) {
            return [
                'design_current_a' => null,
                'recommended_supply_v' => null,
                'recommended_phase' => null,
                'status' => EngineeringResultStatus::RequiresVerification,
                'warnings' => [$this->warning(
                    'no_calculable_load',
                    null,
                    'No calculable electrical load is available for an aggregate supply recommendation.',
                )],
            ];
        }

        $knownPhases = array_values(array_filter(array_map(
            static fn (array $candidate): ?ElectricalPhase => $candidate['phase'],
            $activeCandidates,
        )));

        if (count($knownPhases) !== count($activeCandidates)) {
            return [
                'design_current_a' => null,
                'recommended_supply_v' => null,
                'recommended_phase' => null,
                'status' => EngineeringResultStatus::RequiresVerification,
                'warnings' => [$this->warning(
                    'aggregate_phase_incomplete',
                    null,
                    'Aggregate supply cannot be determined because one or more loads do not have phase information.',
                )],
            ];
        }

        $containsThreePhase = in_array(ElectricalPhase::ThreePhase, $knownPhases, true);
        $recommendedPhase = $containsThreePhase
            ? ElectricalPhase::ThreePhase
            : $knownPhases[0];

        $samePhase = count(array_unique(array_map(
            static fn (ElectricalPhase $phase): string => $phase->value,
            $knownPhases,
        ))) === 1;

        $voltageCandidates = array_values(array_filter(array_map(
            static function (array $candidate) use ($recommendedPhase): ?float {
                if ($candidate['phase'] !== $recommendedPhase) {
                    return null;
                }

                return $candidate['voltage_v'];
            },
            $activeCandidates,
        ), static fn (?float $voltage): bool => $voltage !== null));

        $uniqueVoltages = array_values(array_unique(array_map(
            fn (float $voltage): string => number_format($voltage, 3, '.', ''),
            $voltageCandidates,
        )));

        $recommendedSupplyV = count($uniqueVoltages) === 1
            ? (float) $uniqueVoltages[0]
            : null;

        $warnings = [];
        $status = EngineeringResultStatus::Calculated;

        if ($recommendedSupplyV === null) {
            $status = EngineeringResultStatus::RequiresVerification;
            $warnings[] = $this->warning(
                'aggregate_voltage_inconsistent',
                null,
                'A single preliminary supply voltage cannot be selected because compatible load voltages are incomplete or inconsistent.',
            );
        }

        if (! $samePhase) {
            $status = EngineeringResultStatus::RequiresVerification;
            $warnings[] = $this->warning(
                'mixed_phase_distribution_not_calculated',
                null,
                'The configuration contains mixed single-phase and three-phase loads. V1 does not perform phase distribution or phase balancing, so aggregate design current requires verification.',
            );
        }

        $allPowerFactorsKnown = count(array_filter(
            $activeCandidates,
            static fn (array $candidate): bool => $candidate['power_factor'] !== null,
        )) === count($activeCandidates);

        $designCurrentA = null;

        if ($samePhase && $recommendedSupplyV !== null && $allPowerFactorsKnown) {
            $apparentPowerVa = array_reduce(
                $activeCandidates,
                static function (float $carry, array $candidate): float {
                    $powerFactor = $candidate['power_factor'];

                    if ($powerFactor === null) {
                        return $carry;
                    }

                    return $carry + ($candidate['design_power_w'] / $powerFactor);
                },
                0.0,
            );

            $designCurrentA = $recommendedPhase === ElectricalPhase::ThreePhase
                ? $apparentPowerVa / (sqrt(3) * $recommendedSupplyV)
                : $apparentPowerVa / $recommendedSupplyV;

            $designCurrentA = $this->roundEngineeringValue($designCurrentA);
        } elseif (! $allPowerFactorsKnown) {
            $status = EngineeringResultStatus::RequiresVerification;
            $warnings[] = $this->warning(
                'aggregate_power_factor_incomplete',
                null,
                'Aggregate design current is unavailable because one or more loads do not have a verified power factor.',
            );
        }

        return [
            'design_current_a' => $designCurrentA,
            'recommended_supply_v' => $recommendedSupplyV,
            'recommended_phase' => $recommendedPhase,
            'status' => $status,
            'warnings' => $warnings,
        ];
    }

    private function calculateCurrent(
        float $designPowerW,
        float $voltageV,
        ElectricalPhase $phase,
        float $powerFactor,
    ): float {
        $denominator = $phase === ElectricalPhase::ThreePhase
            ? sqrt(3) * $voltageV * $powerFactor
            : $voltageV * $powerFactor;

        return $this->roundEngineeringValue($designPowerW / $denominator);
    }

    /**
     * @param  list<EngineeringResultStatus>  $statuses
     */
    private function mostSevereStatus(array $statuses): EngineeringResultStatus
    {
        if ($statuses === []) {
            return EngineeringResultStatus::RequiresVerification;
        }

        $severity = static fn (EngineeringResultStatus $status): int => match ($status) {
            EngineeringResultStatus::Calculated => 0,
            EngineeringResultStatus::Assumed => 1,
            EngineeringResultStatus::Estimated => 2,
            EngineeringResultStatus::RequiresVerification => 3,
        };

        return array_reduce(
            $statuses,
            static fn (EngineeringResultStatus $current, EngineeringResultStatus $candidate): EngineeringResultStatus => $severity($candidate) > $severity($current) ? $candidate : $current,
            EngineeringResultStatus::Calculated,
        );
    }

    private function phase(mixed $value): ?ElectricalPhase
    {
        if ($value instanceof ElectricalPhase) {
            return $value;
        }

        return is_string($value) ? ElectricalPhase::tryFrom($value) : null;
    }

    private function nullableInteger(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_string($value) && ctype_digit($value)) {
            return (int) $value;
        }

        return null;
    }

    private function positiveNumber(mixed $value): ?float
    {
        if (! is_int($value) && ! is_float($value) && ! is_string($value)) {
            return null;
        }

        if (! is_numeric($value)) {
            return null;
        }

        $number = (float) $value;

        return is_finite($number) && $number > 0.0 ? $number : null;
    }

    private function powerFactor(mixed $value): ?float
    {
        $number = $this->positiveNumber($value);

        return $number !== null && $number <= 1.0 ? $number : null;
    }

    private function boundedFactor(mixed $value): ?float
    {
        $number = $this->positiveNumber($value);

        return $number !== null && $number <= 1.0 ? $number : null;
    }

    private function nonEmptyString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    /**
     * @return array<string, mixed>
     */
    private function warning(string $code, ?int $lineId, string $message): array
    {
        return [
            'code' => $code,
            'configuration_line_id' => $lineId,
            'message' => $message,
        ];
    }

    private function roundEngineeringValue(float $value): float
    {
        return round($value, 3);
    }
}
