<?php

use App\Actions\Engineering\CreateCalculationSnapshot;
use App\Configuration\ConfigurationStatus;
use App\Engineering\CalculationLineType;
use App\Engineering\EngineeringResultStatus;
use App\Equipment\ElectricalPhase;
use App\Models\Configuration\ConfigurationLine;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationLine;
use App\Models\Engineering\CalculationSnapshot;
use Illuminate\Support\Facades\Schema;

test('engineering schema stores technical snapshots without commercial pricing', function () {
    expect(Schema::hasColumns('calculation_snapshots', [
        'id', 'project_configuration_id', 'version', 'calculator_version', 'input_hash',
        'connected_load_w', 'design_load_w', 'design_current_a', 'recommended_supply_v',
        'recommended_phase', 'result_status', 'input_payload', 'result_payload', 'assumptions',
        'warnings', 'calculated_by_user_id', 'calculated_at', 'finalized_at',
    ]))->toBeTrue()
        ->and(Schema::hasColumns('calculation_lines', [
            'id', 'calculation_snapshot_id', 'source_configuration_line_id', 'line_code',
            'line_type', 'description', 'quantity', 'rated_power_w', 'design_power_w',
            'design_current_a', 'phase', 'circuit_group', 'recommended_protection',
            'recommended_rating_a', 'result_status', 'education_reference', 'calculation_detail',
        ]))->toBeTrue();

    $commercialColumns = [
        'currency_code', 'total_cost', 'total_price', 'unit_cost', 'unit_price', 'line_total',
    ];

    foreach (['calculation_snapshots', 'calculation_lines'] as $table) {
        foreach ($commercialColumns as $column) {
            expect(Schema::hasColumn($table, $column))->toBeFalse();
        }
    }
});

test('calculation snapshots may only be created from a locked configuration', function () {
    $configuration = ProjectConfiguration::factory()->create();

    expect(fn () => CalculationSnapshot::factory()
        ->for($configuration, 'projectConfiguration')
        ->create())->toThrow(LogicException::class);

    $configuration->update(['status' => ConfigurationStatus::Locked]);

    $snapshot = CalculationSnapshot::factory()
        ->for($configuration, 'projectConfiguration')
        ->create();

    expect($snapshot->projectConfiguration->is($configuration))->toBeTrue()
        ->and($snapshot->result_status)->toBe(EngineeringResultStatus::Calculated)
        ->and($snapshot->recommended_phase)->toBe(ElectricalPhase::ThreePhase);
});

test('calculation snapshots and their technical lines are immutable', function () {
    $snapshot = CalculationSnapshot::factory()->unfinalized()->create();
    $line = CalculationLine::factory()
        ->for($snapshot, 'calculationSnapshot')
        ->create([
            'line_type' => CalculationLineType::Protection,
            'recommended_protection' => 'MCCB',
            'recommended_rating_a' => 40,
        ]);
    $snapshot->finalize();

    expect($snapshot->lines)->toHaveCount(1)
        ->and($snapshot->isFinalized())->toBeTrue()
        ->and($line->calculationSnapshot->is($snapshot))->toBeTrue()
        ->and(fn () => $snapshot->update(['design_load_w' => 1]))->toThrow(LogicException::class)
        ->and(fn () => $snapshot->delete())->toThrow(LogicException::class)
        ->and(fn () => $line->update(['recommended_rating_a' => 63]))->toThrow(LogicException::class)
        ->and(fn () => $line->delete())->toThrow(LogicException::class);
});

test('calculation input hashes use a canonical deterministic payload', function () {
    $firstPayload = [
        'zeta' => ['b' => 2, 'a' => 1],
        'alpha' => [['name' => 'washer', 'quantity' => 2]],
    ];
    $secondPayload = [
        'alpha' => [['quantity' => 2, 'name' => 'washer']],
        'zeta' => ['a' => 1, 'b' => 2],
    ];

    expect(CalculationSnapshot::canonicalInputPayload($firstPayload))
        ->toBe(CalculationSnapshot::canonicalInputPayload($secondPayload))
        ->and(CalculationSnapshot::inputHashFor($firstPayload))
        ->toBe(CalculationSnapshot::inputHashFor($secondPayload));
});

test('direct calculation snapshot creation ignores caller supplied input provenance', function () {
    $configuration = ProjectConfiguration::factory()->create();
    $configurationLine = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->create(['label' => 'Authoritative line']);
    $configuration->update(['status' => ConfigurationStatus::Locked]);

    $snapshot = CalculationSnapshot::factory()
        ->for($configuration, 'projectConfiguration')
        ->create([
            'input_payload' => ['forged' => true],
            'input_hash' => str_repeat('0', 64),
        ]);

    expect($snapshot->input_payload)->not->toHaveKey('forged')
        ->and($snapshot->input_payload['project_configuration']['id'])->toBe($configuration->id)
        ->and($snapshot->input_payload['configuration_lines'][0]['id'])->toBe($configurationLine->id)
        ->and($snapshot->input_payload['configuration_lines'][0]['label'])->toBe('Authoritative line')
        ->and($snapshot->input_hash)->toBe(CalculationSnapshot::inputHashFor($snapshot->input_payload))
        ->and($snapshot->input_hash)->not->toBe(str_repeat('0', 64));
});

test('calculation snapshot action freezes inputs creates lines and finalizes atomically', function () {
    $configuration = ProjectConfiguration::factory()->create();
    $configurationLine = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->estimated()
        ->create([
            'label' => 'Existing washer estimate',
            'quantity' => 4,
            'sort_order' => 1,
        ]);
    $configuration->update(['status' => ConfigurationStatus::Locked]);

    $snapshot = app(CreateCalculationSnapshot::class)->handle(
        $configuration,
        [
            'calculator_version' => 'preliminary-v2',
            'connected_load_w' => 12_000,
            'design_load_w' => 9_600,
            'design_current_a' => 25.2,
            'recommended_supply_v' => 380,
            'recommended_phase' => ElectricalPhase::ThreePhase,
            'result_status' => EngineeringResultStatus::Calculated,
            'result_payload' => ['recommendation' => 'preliminary_panel_configuration'],
            'input_hash' => str_repeat('0', 64),
        ],
        [[
            'source_configuration_line_id' => $configurationLine->id,
            'line_code' => 'LOAD-WASHERS',
            'line_type' => CalculationLineType::Load,
            'description' => 'Washer connected load',
            'quantity' => 4,
            'rated_power_w' => 3000,
            'design_power_w' => 9600,
            'design_current_a' => 25.2,
            'phase' => ElectricalPhase::ThreePhase,
            'result_status' => EngineeringResultStatus::Calculated,
            'calculation_detail' => ['demand_factor' => 0.8],
        ]],
    );

    expect($snapshot->isFinalized())->toBeTrue()
        ->and($snapshot->version)->toBe(1)
        ->and($snapshot->lines)->toHaveCount(1)
        ->and($snapshot->lines->first()->source_configuration_line_id)->toBe($configurationLine->id)
        ->and($snapshot->input_payload['configuration_lines'][0]['equipment_snapshot'])
        ->toBe(CalculationSnapshot::canonicalInputPayload([
            'equipment_snapshot' => $configurationLine->equipment_snapshot,
        ])['equipment_snapshot'])
        ->and($snapshot->input_hash)->toBe(CalculationSnapshot::inputHashFor($snapshot->input_payload))
        ->and($snapshot->input_hash)->not->toBe(str_repeat('0', 64));

    $snapshot->ensureFinalized();
});

test('engineering results can explicitly require verification', function () {
    $snapshot = CalculationSnapshot::factory()->requiresVerification()->create();

    expect($snapshot->result_status)->toBe(EngineeringResultStatus::RequiresVerification)
        ->and($snapshot->warnings)->not->toBeEmpty();
});
