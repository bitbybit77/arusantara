<?php

use App\Configuration\ConfigurationStatus;
use App\Configuration\EquipmentStatus;
use App\Configuration\SpecificationBasis;
use App\Equipment\SpecificationConfidence;
use App\Models\Configuration\ConfigurationLine;
use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Equipment\EquipmentModel;
use App\Models\Equipment\EquipmentSource;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

test('configuration schema supports customer projects and versioned equipment inputs', function () {
    expect(Schema::hasColumns('projects', [
        'id', 'customer_id', 'code', 'name', 'description', 'status',
    ]))->toBeTrue()
        ->and(Schema::hasColumns('project_configurations', [
            'id', 'project_id', 'version', 'status', 'created_by_user_id', 'locked_at',
        ]))->toBeTrue()
        ->and(Schema::hasColumns('configuration_lines', [
            'id', 'project_configuration_id', 'equipment_category_id', 'equipment_model_id',
            'label', 'quantity', 'equipment_status', 'usage_profile', 'customer_parameters',
            'equipment_snapshot', 'specification_basis', 'specification_confidence', 'notes',
            'sort_order',
        ]))->toBeTrue()
        ->and(Schema::hasIndex('projects', ['code'], 'unique'))->toBeTrue()
        ->and(Schema::hasIndex('project_configurations', ['project_id', 'version'], 'unique'))->toBeTrue();
});

test('configuration specification basis distinguishes exact category-based and estimated inputs', function () {
    $configuration = ProjectConfiguration::factory()->create();
    $equipmentModel = EquipmentModel::factory()->create([
        'specification_confidence' => SpecificationConfidence::High,
    ]);

    $exactLine = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->forEquipmentModel($equipmentModel)
        ->create();
    $categoryBasedLine = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->categoryBased()
        ->create();
    $estimatedLine = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->estimated()
        ->create();

    expect($exactLine->specification_basis)->toBe(SpecificationBasis::Exact)
        ->and($exactLine->specification_confidence)->toBe(SpecificationConfidence::High)
        ->and($categoryBasedLine->specification_basis)->toBe(SpecificationBasis::CategoryBased)
        ->and($estimatedLine->specification_basis)->toBe(SpecificationBasis::Estimated)
        ->and(fn () => ConfigurationLine::factory()
            ->for($configuration, 'projectConfiguration')
            ->create(['specification_basis' => SpecificationBasis::Exact]))
        ->toThrow(LogicException::class, 'requires a selected equipment model');
});

test('exact selections replace caller data with an atomic canonical catalog snapshot', function () {
    $equipmentModel = EquipmentModel::factory()->create([
        'brand' => 'Canonical Brand',
        'model' => 'Canonical Model',
        'rated_power_w' => 4250,
        'specification_confidence' => SpecificationConfidence::High,
    ]);
    $source = EquipmentSource::factory()
        ->for($equipmentModel)
        ->create(['source_name' => 'Manufacturer data sheet']);

    $line = ConfigurationLine::factory()
        ->forEquipmentModel($equipmentModel)
        ->create([
            'equipment_snapshot' => [
                'equipment_category_id' => $equipmentModel->equipment_category_id,
                'equipment_model_id' => $equipmentModel->id,
                'rated_power_w' => 1,
            ],
            'specification_basis' => SpecificationBasis::Estimated,
            'specification_confidence' => SpecificationConfidence::Low,
        ]);

    $capturedSnapshot = $line->equipment_snapshot;

    expect($line->specification_basis)->toBe(SpecificationBasis::Exact)
        ->and($line->specification_confidence)->toBe(SpecificationConfidence::High)
        ->and($capturedSnapshot['rated_power_w'])->toBe('4250.000')
        ->and($capturedSnapshot['technical']['rated_power_w'])->toBe('4250.000')
        ->and($capturedSnapshot['category']['id'])->toBe($equipmentModel->equipment_category_id)
        ->and($capturedSnapshot['provenance']['sources'][0]['id'])->toBe($source->id);

    $equipmentModel->update(['rated_power_w' => 5000]);
    $equipmentModel->category->update(['name' => 'Renamed category']);
    $source->update(['source_name' => 'Revised data sheet']);

    expect($line->fresh()->equipment_snapshot)->toBe($capturedSnapshot);
});

test('a customer owns projects with independently versioned configurations', function () {
    $customer = User::factory()->create();
    $project = Project::factory()->for($customer, 'customer')->create();

    $firstConfiguration = ProjectConfiguration::factory()
        ->for($project)
        ->for($customer, 'createdBy')
        ->create(['version' => 1]);

    $secondConfiguration = ProjectConfiguration::factory()
        ->for($project)
        ->for($customer, 'createdBy')
        ->create(['version' => 2]);

    expect($project->customer->is($customer))->toBeTrue()
        ->and($project->configurations)->toHaveCount(2)
        ->and($firstConfiguration->project->is($project))->toBeTrue()
        ->and($secondConfiguration->version)->toBe(2)
        ->and(fn () => ProjectConfiguration::factory()
            ->for($project)
            ->for($customer, 'createdBy')
            ->create(['version' => 2]))->toThrow(QueryException::class);
});

test('configuration lines require a technical snapshot that survives equipment catalog changes', function () {
    $equipmentModel = EquipmentModel::factory()->create([
        'brand' => 'LaundryTech',
        'model' => 'Dryer A',
        'rated_power_w' => 3000,
        'voltage_v' => 220,
    ]);

    $configuration = ProjectConfiguration::factory()->create();
    $line = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->forEquipmentModel($equipmentModel)
        ->create([
            'equipment_status' => EquipmentStatus::Existing,
            'quantity' => 4,
        ]);

    $capturedSnapshot = $line->equipment_snapshot;

    $equipmentModel->update(['rated_power_w' => 3200]);

    expect($line->fresh()->equipment_snapshot)->toBe($capturedSnapshot)
        ->and($line->fresh()->equipment_snapshot['rated_power_w'])->toBe('3000.000')
        ->and(fn () => DB::table('configuration_lines')->insert([
            'project_configuration_id' => $configuration->id,
            'equipment_category_id' => $equipmentModel->equipment_category_id,
            'equipment_model_id' => $equipmentModel->id,
            'label' => 'Missing snapshot',
            'quantity' => 1,
        ]))->toThrow(QueryException::class);
});

test('locked configurations and their lines cannot be silently changed', function () {
    $configuration = ProjectConfiguration::factory()->create();
    $line = ConfigurationLine::factory()
        ->for($configuration, 'projectConfiguration')
        ->create();

    $configuration->update(['status' => ConfigurationStatus::Locked]);

    expect($configuration->fresh()->locked_at)->not->toBeNull()
        ->and(fn () => $line->update(['quantity' => 99]))->toThrow(LogicException::class)
        ->and(fn () => ConfigurationLine::factory()
            ->for($configuration, 'projectConfiguration')
            ->create())->toThrow(LogicException::class)
        ->and(fn () => $configuration->update(['version' => 2]))->toThrow(LogicException::class)
        ->and(fn () => $configuration->delete())->toThrow(LogicException::class);
});

test('persisted configuration locks also protect stale model instances', function () {
    $configuration = ProjectConfiguration::factory()->create();
    $staleConfiguration = ProjectConfiguration::query()->findOrFail($configuration->id);

    $configuration->update(['status' => ConfigurationStatus::Locked]);

    expect(fn () => $staleConfiguration->update(['version' => 2]))
        ->toThrow(LogicException::class, 'version and ownership are immutable')
        ->and(fn () => $staleConfiguration->delete())
        ->toThrow(LogicException::class, 'cannot be deleted');
});
