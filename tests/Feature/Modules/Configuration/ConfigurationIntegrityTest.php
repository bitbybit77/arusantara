<?php

use App\Models\Configuration\ConfigurationLine;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Equipment\EquipmentCategory;
use App\Models\Equipment\EquipmentModel;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

test('configuration lines reject equipment models from another category', function () {
    $equipmentModel = EquipmentModel::factory()->create();
    $otherCategory = EquipmentCategory::factory()->create();
    $configuration = ProjectConfiguration::factory()->create();

    expect(fn () => ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->forEquipmentModel($equipmentModel)
        ->create([
            'equipment_category_id' => $otherCategory->id,
            'equipment_snapshot' => [
                'equipment_category_id' => $otherCategory->id,
                'equipment_model_id' => $equipmentModel->id,
            ],
        ]))->toThrow(LogicException::class, 'does not belong');
});

test('configuration lines require coherent non-empty equipment snapshots', function () {
    $equipmentModel = EquipmentModel::factory()->create();
    $configuration = ProjectConfiguration::factory()->create();

    expect(fn () => ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->create(['equipment_snapshot' => []]))
        ->toThrow(LogicException::class, 'non-empty equipment snapshot');

    $exactLine = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->forEquipmentModel($equipmentModel)
        ->create([
            'equipment_snapshot' => [
                'equipment_category_id' => $equipmentModel->equipment_category_id,
                'equipment_model_id' => $equipmentModel->id + 1,
            ],
        ]);

    $categoryOnlyLine = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->create();

    expect($categoryOnlyLine->equipment_model_id)->toBeNull()
        ->and($categoryOnlyLine->equipment_snapshot['equipment_category_id'])
        ->toBe($categoryOnlyLine->equipment_category_id)
        ->and($exactLine->equipment_snapshot['equipment_model_id'])->toBe($equipmentModel->id);
});

test('database composite foreign key protects equipment model category integrity', function () {
    $equipmentModel = EquipmentModel::factory()->create();
    $otherCategory = EquipmentCategory::factory()->create();
    $configuration = ProjectConfiguration::factory()->create();

    expect(fn () => DB::table('configuration_lines')->insert([
        'project_configuration_id' => $configuration->id,
        'equipment_category_id' => $otherCategory->id,
        'equipment_model_id' => $equipmentModel->id,
        'label' => 'Mismatched model and category',
        'quantity' => 1,
        'equipment_snapshot' => json_encode([
            'equipment_category_id' => $otherCategory->id,
            'equipment_model_id' => $equipmentModel->id,
        ], JSON_THROW_ON_ERROR),
    ]))->toThrow(QueryException::class);
});
