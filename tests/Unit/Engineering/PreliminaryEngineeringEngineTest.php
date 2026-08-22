<?php

use App\Engineering\EngineeringResultStatus;
use App\Engineering\PreliminaryEngineeringEngine;
use App\Equipment\ElectricalPhase;

function engineeringInput(array $overrides = []): array
{
    $line = array_replace_recursive([
        'id' => 10,
        'label' => 'Commercial dryer',
        'quantity' => 2,
        'usage_profile' => [
            'demand_factor' => 0.8,
        ],
        'specification_basis' => 'exact',
        'equipment_snapshot' => [
            'technical' => [
                'rated_power_w' => 3000,
                'voltage_v' => 380,
                'phase' => ElectricalPhase::ThreePhase->value,
                'power_factor' => 0.8,
                'efficiency' => 0.9,
            ],
        ],
    ], $overrides);

    return [
        'schema_version' => 1,
        'project_configuration' => [
            'id' => 1,
            'project_id' => 1,
            'version' => 1,
            'status' => 'locked',
            'locked_at' => '2026-08-22T12:00:00+00:00',
        ],
        'configuration_lines' => [$line],
    ];
}

test('preliminary engine deterministically calculates a complete three phase load', function () {
    $result = app(PreliminaryEngineeringEngine::class)->calculate(engineeringInput());

    expect($result->calculatorVersion)->toBe('preliminary-v1')
        ->and($result->connectedLoadW)->toBe(6000.0)
        ->and($result->designLoadW)->toBe(4800.0)
        ->and($result->designCurrentA)->toBe(9.116)
        ->and($result->recommendedSupplyV)->toBe(380.0)
        ->and($result->recommendedPhase)->toBe(ElectricalPhase::ThreePhase)
        ->and($result->resultStatus)->toBe(EngineeringResultStatus::Assumed)
        ->and($result->calculationLines)->toHaveCount(1)
        ->and($result->calculationLines[0]['design_current_a'])->toBe(9.116)
        ->and($result->calculationLines[0]['recommended_protection'] ?? null)->toBeNull();
});

test('preliminary engine refuses to invent a power factor', function () {
    $input = engineeringInput([
        'equipment_snapshot' => [
            'technical' => [
                'power_factor' => null,
            ],
        ],
    ]);

    $result = app(PreliminaryEngineeringEngine::class)->calculate($input);

    expect($result->connectedLoadW)->toBe(6000.0)
        ->and($result->designLoadW)->toBe(4800.0)
        ->and($result->designCurrentA)->toBeNull()
        ->and($result->resultStatus)->toBe(EngineeringResultStatus::RequiresVerification)
        ->and(collect($result->warnings)->pluck('code'))->toContain('missing_power_factor');
});

test('preliminary engine uses full demand when no verified demand rule is available', function () {
    $result = app(PreliminaryEngineeringEngine::class)->calculate(engineeringInput([
        'usage_profile' => ['demand_factor' => null],
    ]));

    expect($result->connectedLoadW)->toBe(6000.0)
        ->and($result->designLoadW)->toBe(6000.0)
        ->and($result->resultStatus)->toBe(EngineeringResultStatus::Assumed)
        ->and(collect($result->assumptions)->pluck('code'))->toContain('conservative_full_demand');
});

test('preliminary engine is deterministic for the same captured input', function () {
    $engine = app(PreliminaryEngineeringEngine::class);
    $input = engineeringInput();

    $first = $engine->calculate($input);
    $second = $engine->calculate($input);

    expect($first->snapshotAttributes())->toBe($second->snapshotAttributes())
        ->and($first->calculationLines)->toBe($second->calculationLines);
});
