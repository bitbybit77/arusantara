<?php

use App\Actions\Engineering\CalculateProjectConfiguration;
use App\Configuration\ConfigurationStatus;
use App\Engineering\EngineeringResultStatus;
use App\Equipment\ElectricalPhase;
use App\Models\Configuration\ConfigurationLine;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationSnapshot;

test('locked configuration can be calculated and frozen by the preliminary engine', function () {
    $configuration = ProjectConfiguration::factory()->create();
    $configurationLine = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->estimated()
        ->create([
            'label' => 'Commercial dryer estimate',
            'quantity' => 2,
            'usage_profile' => ['demand_factor' => 0.8],
            'sort_order' => 1,
        ]);

    $equipmentSnapshot = $configurationLine->equipment_snapshot;
    $equipmentSnapshot['rated_power_w'] = 3000;
    $equipmentSnapshot['voltage_v'] = 380;
    $equipmentSnapshot['phase'] = ElectricalPhase::ThreePhase->value;
    $equipmentSnapshot['power_factor'] = 0.8;
    $equipmentSnapshot['technical'] = [
        'rated_power_w' => 3000,
        'voltage_v' => 380,
        'phase' => ElectricalPhase::ThreePhase->value,
        'power_factor' => 0.8,
        'efficiency' => 0.9,
    ];

    $configurationLine->update([
        'equipment_snapshot' => $equipmentSnapshot,
    ]);

    $configuration->update(['status' => ConfigurationStatus::Locked]);

    $snapshot = app(CalculateProjectConfiguration::class)->handle($configuration);

    expect($snapshot->isFinalized())->toBeTrue()
        ->and($snapshot->calculator_version)->toBe('preliminary-v1')
        ->and((float) $snapshot->connected_load_w)->toBe(6000.0)
        ->and((float) $snapshot->design_load_w)->toBe(4800.0)
        ->and((float) $snapshot->design_current_a)->toBe(9.116)
        ->and((float) $snapshot->recommended_supply_v)->toBe(380.0)
        ->and($snapshot->recommended_phase)->toBe(ElectricalPhase::ThreePhase)
        ->and($snapshot->result_status)->toBe(EngineeringResultStatus::Estimated)
        ->and($snapshot->lines)->toHaveCount(1)
        ->and($snapshot->lines->first()->source_configuration_line_id)->toBe($configurationLine->id)
        ->and($snapshot->input_hash)->toBe(CalculationSnapshot::inputHashFor($snapshot->input_payload));
});
