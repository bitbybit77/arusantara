<?php

use App\Models\Configuration\Project;
use App\Models\Equipment\EquipmentModel;
use App\Models\User;
use Database\Seeders\EquipmentCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lets a customer create a project configure equipment and calculate a frozen result', function () {
    $this->seed(EquipmentCatalogSeeder::class);

    $customer = User::factory()->customer()->create();

    $this->actingAs($customer)
        ->post('/projects', [
            'name' => 'Laundry Permata',
            'description' => 'Laundry commercial MVP scenario.',
            'business_category' => 'laundry',
        ])
        ->assertRedirect();

    $project = Project::query()->where('customer_id', $customer->id)->firstOrFail();
    $configuration = $project->configurations()->firstOrFail();

    $washer = EquipmentModel::query()->where('model', 'WH6-8')->firstOrFail();
    $dryer = EquipmentModel::query()->where('model', 'TD6-10')->firstOrFail();

    $this->actingAs($customer)
        ->put("/projects/{$project->id}/configuration", [
            'items' => [
                [
                    'equipment_model_id' => $washer->id,
                    'quantity' => 2,
                    'equipment_status' => 'existing',
                    'simultaneous_use' => true,
                ],
                [
                    'equipment_model_id' => $dryer->id,
                    'quantity' => 1,
                    'equipment_status' => 'planned',
                    'simultaneous_use' => true,
                ],
            ],
        ])
        ->assertRedirect(route('projects.configuration.edit', $project));

    expect($configuration->lines()->count())->toBe(2);

    $this->actingAs($customer)
        ->post("/projects/{$project->id}/calculate")
        ->assertRedirect(route('projects.engineering.show', $project));

    $configuration->refresh();
    $snapshot = $configuration->calculationSnapshots()->latest('version')->firstOrFail();

    expect((string) $configuration->getRawOriginal('status'))->toBe('locked')
        ->and((float) $snapshot->connected_load_w)->toBe(24000.0)
        ->and($snapshot->input_hash)->not->toBeEmpty()
        ->and($snapshot->isFinalized())->toBeTrue();

    $this->actingAs($customer)
        ->get("/projects/{$project->id}/engineering")
        ->assertOk();
});

it('does not let another customer access a project', function () {
    $owner = User::factory()->customer()->create();
    $other = User::factory()->customer()->create();
    $project = Project::factory()->for($owner, 'customer')->create();

    $this->actingAs($other)
        ->get("/projects/{$project->id}")
        ->assertNotFound();
});
