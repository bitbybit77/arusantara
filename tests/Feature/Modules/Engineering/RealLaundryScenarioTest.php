<?php

use App\Actions\Engineering\CalculateProjectConfiguration;
use App\Configuration\ConfigurationStatus;
use App\Engineering\EngineeringResultStatus;
use App\Equipment\ElectricalPhase;
use App\Models\Configuration\ConfigurationLine;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Equipment\EquipmentModel;
use Database\Seeders\EquipmentCatalogSeeder;

it('calculates and freezes a source-backed real laundry scenario without inventing missing power factor', function () {
    $this->seed(EquipmentCatalogSeeder::class);

    $configuration = ProjectConfiguration::factory()->create();

    $scenario = [
        [
            'model' => 'WH6-8',
            'variant' => '380-415v-3n-electric-7.8kw-50hz-basis',
            'quantity' => 2,
        ],
        [
            'model' => 'WH6-11',
            'variant' => '380-415v-3n-electric-7.6kw-50hz-basis',
            'quantity' => 2,
        ],
        [
            'model' => 'TD6-10',
            'variant' => '380-415v-3n-electric-8.4kw-50hz-basis',
            'quantity' => 2,
        ],
        [
            'model' => 'TD6-14',
            'variant' => '380-415v-3n-heat-pump-6.5kw-50hz-basis',
            'quantity' => 1,
        ],
    ];

    foreach ($scenario as $sortOrder => $item) {
        $equipmentModel = EquipmentModel::query()
            ->where('brand', 'Electrolux Professional')
            ->where('model', $item['model'])
            ->where('specification_variant', $item['variant'])
            ->firstOrFail();

        ConfigurationLine::factory()
            ->for($configuration, 'projectConfiguration')
            ->forEquipmentModel($equipmentModel)
            ->create([
                'quantity' => $item['quantity'],
                'usage_profile' => [
                    'simultaneous_use' => true,
                ],
                'sort_order' => $sortOrder + 1,
            ]);
    }

    $configuration->update([
        'status' => ConfigurationStatus::Locked,
    ]);

    $snapshot = app(CalculateProjectConfiguration::class)->handle($configuration);

    expect($snapshot->isFinalized())->toBeTrue()
        ->and($snapshot->calculator_version)->toBe('preliminary-v1')
        ->and((float) $snapshot->connected_load_w)->toBe(54100.0)
        ->and((float) $snapshot->design_load_w)->toBe(54100.0)
        ->and($snapshot->design_current_a)->toBeNull()
        ->and((float) $snapshot->recommended_supply_v)->toBe(380.0)
        ->and($snapshot->recommended_phase)->toBe(ElectricalPhase::ThreePhase)
        ->and($snapshot->result_status)->toBe(EngineeringResultStatus::RequiresVerification)
        ->and($snapshot->lines)->toHaveCount(4)
        ->and($snapshot->input_hash)->toBe(CalculationSnapshot::inputHashFor($snapshot->input_payload));

    $warnings = collect($snapshot->warnings);

    expect($warnings->where('code', 'missing_power_factor'))->toHaveCount(4)
        ->and($warnings->contains(
            fn (array $warning): bool => $warning['code'] === 'aggregate_power_factor_incomplete',
        ))->toBeTrue();

    $capturedInputLines = collect($snapshot->input_payload['configuration_lines']);

    expect($capturedInputLines)->toHaveCount(4)
        ->and($capturedInputLines->every(function (array $line): bool {
            $snapshot = $line['equipment_snapshot'] ?? [];
            $sources = data_get($snapshot, 'provenance.sources', []);

            return is_string($snapshot['specification_variant'] ?? null)
                && ($snapshot['specification_variant'] ?? '') !== ''
                && is_array($sources)
                && $sources !== []
                && collect($sources)->every(
                    fn (array $source): bool => is_string($source['source_url'] ?? null)
                        && ($source['source_url'] ?? '') !== '',
                );
        }))->toBeTrue();
});
