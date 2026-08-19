<?php

use App\Configuration\ConfigurationStatus;
use App\Models\Configuration\ConfigurationLine;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationLine;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Procurement\Rfq;

test('calculation line sources must belong to the snapshot configuration', function () {
    $snapshotConfiguration = ProjectConfiguration::factory()->create();
    $matchingSource = ConfigurationLine::factory()
        ->for($snapshotConfiguration, 'projectConfiguration')
        ->create();
    $snapshotConfiguration->update(['status' => ConfigurationStatus::Locked]);

    $snapshot = CalculationSnapshot::factory()
        ->unfinalized()
        ->for($snapshotConfiguration, 'projectConfiguration')
        ->create();

    $otherSource = ConfigurationLine::factory()->create();

    expect(fn () => CalculationLine::factory()
        ->for($snapshot, 'calculationSnapshot')
        ->forConfigurationLine($otherSource)
        ->create())->toThrow(LogicException::class, 'does not belong')
        ->and(CalculationLine::factory()
            ->for($snapshot, 'calculationSnapshot')
            ->forConfigurationLine($matchingSource)
            ->create()
            ->source_configuration_line_id)->toBe($matchingSource->id);
});

test('calculation line factory aligns its generated snapshot to the source configuration', function () {
    $configuration = ProjectConfiguration::factory()->create();
    $source = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->create();
    $configuration->update(['status' => ConfigurationStatus::Locked]);

    $calculationLine = CalculationLine::factory()
        ->forConfigurationLine($source)
        ->create();

    expect($calculationLine->calculationSnapshot->project_configuration_id)
        ->toBe($configuration->id);
});

test('calculation lines cannot be added after their aggregate is finalized', function () {
    $snapshot = CalculationSnapshot::factory()->unfinalized()->create();

    CalculationLine::factory()
        ->for($snapshot, 'calculationSnapshot')
        ->create();

    $snapshot->finalize();

    expect(fn () => CalculationLine::factory()
        ->for($snapshot, 'calculationSnapshot')
        ->create())->toThrow(LogicException::class, 'snapshot is finalized')
        ->and($snapshot->lines()->count())->toBe(1);
});

test('calculation lines cannot be added after an RFQ freezes the snapshot', function () {
    $configuration = ProjectConfiguration::factory()->locked()->create();
    $snapshot = CalculationSnapshot::factory()
        ->for($configuration, 'projectConfiguration')
        ->create();

    Rfq::factory()->create([
        'project_id' => $configuration->project_id,
        'calculation_snapshot_id' => $snapshot->id,
        'customer_id' => $configuration->project->customer_id,
    ]);

    expect(fn () => CalculationLine::factory()
        ->for($snapshot, 'calculationSnapshot')
        ->create())->toThrow(LogicException::class, 'referenced by an RFQ')
        ->and($snapshot->lines()->count())->toBe(0);
});
