<?php

use App\Equipment\ElectricalPhase;
use App\Equipment\EquipmentCatalogStatus;
use App\Equipment\SpecificationConfidence;
use App\Models\Equipment\EquipmentCategory;
use App\Models\Equipment\EquipmentModel;
use App\Models\Equipment\EquipmentSource;
use App\VerificationStatus;
use Database\Seeders\EquipmentCatalogSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

test('equipment schema represents the technical catalog and its provenance', function () {
    expect(Schema::hasColumns('equipment_categories', [
        'id', 'parent_id', 'code', 'name', 'description', 'status',
    ]))->toBeTrue()
        ->and(Schema::hasColumns('equipment_models', [
            'id',
            'equipment_category_id',
            'brand',
            'model',
            'equipment_type',
            'specification_variant',
            'rated_power_w',
            'voltage_v',
            'frequency_hz',
            'rated_current_a',
            'phase',
            'power_factor',
            'efficiency',
            'specification_confidence',
            'status',
        ]))->toBeTrue()
        ->and(Schema::hasColumns('equipment_sources', [
            'id',
            'equipment_model_id',
            'source_name',
            'source_url',
            'verification_status',
            'verified_at',
            'verified_by_user_id',
            'notes',
        ]))->toBeTrue()
        ->and(Schema::hasIndex(
            'equipment_models',
            ['equipment_category_id', 'brand', 'model', 'specification_variant'],
            'unique',
        ))->toBeTrue()
        ->and(Schema::hasIndex('equipment_models', ['equipment_category_id', 'status']))->toBeTrue()
        ->and(Schema::hasIndex('equipment_models', ['status', 'specification_confidence']))->toBeTrue()
        ->and(Schema::hasIndex('equipment_sources', ['equipment_model_id', 'verification_status']))->toBeTrue();
});

test('equipment categories can form a hierarchy without losing catalog ownership', function () {
    $parent = EquipmentCategory::factory()->create();
    $child = EquipmentCategory::factory()->for($parent, 'parent')->create();

    expect($parent->status)->toBe(EquipmentCatalogStatus::Active)
        ->and($child->parent->is($parent))->toBeTrue()
        ->and($parent->children->contains($child))->toBeTrue();
});

test('equipment models expose electrical specifications and verified sources', function () {
    $equipmentModel = EquipmentModel::factory()->create([
        'specification_variant' => '220v-1ph',
        'rated_power_w' => 3000,
        'voltage_v' => 220,
        'frequency_hz' => 50,
        'rated_current_a' => 15.25,
        'phase' => ElectricalPhase::SinglePhase,
        'power_factor' => 0.85,
        'efficiency' => 0.9,
        'specification_confidence' => SpecificationConfidence::High,
    ]);

    $source = EquipmentSource::factory()
        ->verified()
        ->for($equipmentModel, 'equipmentModel')
        ->create();

    expect($equipmentModel->category)->toBeInstanceOf(EquipmentCategory::class)
        ->and($equipmentModel->specification_variant)->toBe('220v-1ph')
        ->and($equipmentModel->rated_power_w)->toBe('3000.000')
        ->and($equipmentModel->voltage_v)->toBe('220.00')
        ->and($equipmentModel->frequency_hz)->toBe('50.00')
        ->and($equipmentModel->rated_current_a)->toBe('15.250')
        ->and($equipmentModel->phase)->toBe(ElectricalPhase::SinglePhase)
        ->and($equipmentModel->power_factor)->toBe('0.8500')
        ->and($equipmentModel->efficiency)->toBe('0.9000')
        ->and($equipmentModel->specification_confidence)->toBe(SpecificationConfidence::High)
        ->and($equipmentModel->sources->contains($source))->toBeTrue()
        ->and($source->verification_status)->toBe(VerificationStatus::Verified)
        ->and($source->verified_at)->not->toBeNull()
        ->and($source->verifiedBy)->not->toBeNull();
});

test('equipment model identity is unique per electrical specification variant', function () {
    $category = EquipmentCategory::factory()->create();

    EquipmentModel::factory()->for($category, 'category')->create([
        'brand' => 'LaundryCo',
        'model' => 'DRY-3000',
        'specification_variant' => '380-415v-3ph-electric',
    ]);

    EquipmentModel::factory()->for($category, 'category')->create([
        'brand' => 'LaundryCo',
        'model' => 'DRY-3000',
        'specification_variant' => '220-240v-1ph-electric',
    ]);

    expect(fn () => EquipmentModel::factory()->for($category, 'category')->create([
        'brand' => 'LaundryCo',
        'model' => 'DRY-3000',
        'specification_variant' => '380-415v-3ph-electric',
    ]))->toThrow(QueryException::class);
});

test('database rejects unsupported electrical phases', function () {
    $category = EquipmentCategory::factory()->create();

    expect(fn () => DB::table('equipment_models')->insert([
        'equipment_category_id' => $category->id,
        'brand' => 'Invalid',
        'model' => 'PHASE',
        'phase' => 'two_phase',
    ]))->toThrow(QueryException::class);
});

test('equipment catalog seeder provides idempotent customer-readable categories', function () {
    $this->seed(EquipmentCatalogSeeder::class);
    $this->seed(EquipmentCatalogSeeder::class);

    expect(EquipmentCategory::query()->whereIn('code', [
        'washing-machine',
        'dryer',
        'air-conditioner',
        'pump',
        'lighting',
        'general-socket',
        'compressor',
    ])->count())->toBe(7);
});
