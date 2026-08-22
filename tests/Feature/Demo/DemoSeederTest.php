<?php

use App\Engineering\EngineeringResultStatus;
use App\Models\Configuration\Project;
use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\Rfq;
use App\Models\Procurement\TechnicalDeviation;
use App\Models\User;
use App\Procurement\QuotationStatus;
use App\Procurement\RfqStatus;
use App\Procurement\TechnicalDeviationStatus;
use App\VerificationStatus;
use Database\Seeders\DemoSeeder;

it('seeds one deterministic end-to-end presentation scenario and is safe to rerun', function () {
    $this->seed(DemoSeeder::class);
    $this->seed(DemoSeeder::class);

    $customer = User::query()->where('email', DemoSeeder::CUSTOMER_EMAIL)->firstOrFail();
    $makerUser = User::query()->where('email', DemoSeeder::MAKER_EMAIL)->firstOrFail();
    $maker = MakerProfile::query()->where('user_id', $makerUser->getKey())->firstOrFail();
    $project = Project::query()->where('code', DemoSeeder::PROJECT_CODE)->firstOrFail();
    $configuration = $project->configurations()->firstOrFail();
    $snapshot = $configuration->calculationSnapshots()->firstOrFail();
    $rfq = Rfq::query()->where('project_id', $project->getKey())->firstOrFail();
    $quotation = Quotation::query()->where('rfq_id', $rfq->getKey())->firstOrFail();
    $revision = $quotation->revisions()->whereNotNull('submitted_at')->firstOrFail();
    $deviation = TechnicalDeviation::query()
        ->where('quotation_revision_id', $revision->getKey())
        ->firstOrFail();

    expect(User::query()->where('email', DemoSeeder::CUSTOMER_EMAIL)->count())->toBe(1)
        ->and(User::query()->where('email', DemoSeeder::MAKER_EMAIL)->count())->toBe(1)
        ->and(Project::query()->where('code', DemoSeeder::PROJECT_CODE)->count())->toBe(1)
        ->and($project->customer_id)->toBe($customer->getKey())
        ->and($maker->verification_status)->toBe(VerificationStatus::Verified)
        ->and($configuration->lines)->toHaveCount(4)
        ->and((float) $snapshot->connected_load_w)->toBe(54100.0)
        ->and($snapshot->result_status)->toBe(EngineeringResultStatus::RequiresVerification)
        ->and($rfq->status)->toBe(RfqStatus::Open)
        ->and($quotation->status)->toBe(QuotationStatus::Submitted)
        ->and($quotation->current_revision_id)->toBe($revision->getKey())
        ->and($revision->items)->toHaveCount(2)
        ->and($deviation->status)->toBe(TechnicalDeviationStatus::Pending);
});
