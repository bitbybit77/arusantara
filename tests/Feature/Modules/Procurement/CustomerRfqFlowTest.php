<?php

use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Engineering\CalculationSnapshot;
use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Rfq;
use App\Models\User;
use App\Procurement\RfqStatus;

beforeEach(function () {
    $this->withoutVite();
});

test('customer can create a source-linked RFQ draft and publish it', function () {
    $customer = User::factory()->customer()->create();
    $project = Project::factory()->create(['customer_id' => $customer->id]);
    $configuration = ProjectConfiguration::factory()->locked()->create([
        'project_id' => $project->id,
        'created_by_user_id' => $customer->id,
    ]);
    $snapshot = CalculationSnapshot::factory()->create([
        'project_configuration_id' => $configuration->id,
        'calculated_by_user_id' => $customer->id,
    ]);
    $makers = MakerProfile::factory()->count(2)->create();

    $this->actingAs($customer)
        ->get("/projects/{$project->id}/rfq/create")
        ->assertOk();

    $response = $this->actingAs($customer)
        ->post("/projects/{$project->id}/rfqs", [
            'title' => 'Panel laundry cabang utama',
            'installation_location' => 'Bandung',
            'due_at' => now()->addDays(7)->format('Y-m-d'),
            'customer_note' => 'Mohon verifikasi parameter yang masih belum tersedia.',
            'preferred_maker_profile_ids' => $makers->modelKeys(),
        ]);

    $rfq = Rfq::query()->firstOrFail();

    $response->assertRedirect(route('rfqs.show', $rfq));

    expect($rfq->status)->toBe(RfqStatus::Draft)
        ->and($rfq->project_id)->toBe($project->id)
        ->and($rfq->calculation_snapshot_id)->toBe($snapshot->id)
        ->and($rfq->customer_id)->toBe($customer->id)
        ->and($rfq->requirements['preferred_maker_profile_ids'])->toBe($makers->modelKeys())
        ->and($rfq->requirements['engineering_snapshot_version'])->toBe((int) $snapshot->version);

    $this->actingAs($customer)
        ->get("/rfqs/{$rfq->id}")
        ->assertOk();

    $this->actingAs($customer)
        ->post("/rfqs/{$rfq->id}/publish")
        ->assertRedirect(route('rfqs.show', $rfq));

    $rfq->refresh();

    expect($rfq->status)->toBe(RfqStatus::Open)
        ->and($rfq->published_at)->not->toBeNull();
});

test('another customer cannot access or publish an RFQ', function () {
    $otherCustomer = User::factory()->customer()->create();
    $rfq = Rfq::factory()->create();

    $this->actingAs($otherCustomer)
        ->get("/rfqs/{$rfq->id}")
        ->assertNotFound();

    $this->actingAs($otherCustomer)
        ->post("/rfqs/{$rfq->id}/publish")
        ->assertNotFound();

    expect($rfq->fresh()->status)->toBe(RfqStatus::Draft);
});
