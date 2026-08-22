<?php

namespace Database\Seeders;

use App\Actions\Engineering\CalculateProjectConfiguration;
use App\Actions\Procurement\CreateQuotationDraft;
use App\Actions\Procurement\CreateRfqFromCalculationSnapshot;
use App\Actions\Procurement\PublishRfq;
use App\Actions\Procurement\SubmitQuotationRevision;
use App\Actions\Procurement\UpdateQuotationDraft;
use App\Configuration\ConfigurationStatus;
use App\Configuration\EquipmentStatus;
use App\Identity\MakerProfileStatus;
use App\Identity\UserRole;
use App\Models\Configuration\Project;
use App\Models\Configuration\ProjectConfiguration;
use App\Models\Equipment\EquipmentModel;
use App\Models\Identity\MakerProfile;
use App\Models\User;
use App\VerificationStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public const CUSTOMER_EMAIL = 'customer.demo@arusantara.test';

    public const MAKER_EMAIL = 'maker.demo@arusantara.test';

    public const PASSWORD = 'Arusantara2026!';

    public const PROJECT_CODE = 'DEMO-LAUNDRY-001';

    public function run(): void
    {
        $this->call(EquipmentCatalogSeeder::class);

        DB::transaction(function (): void {
            $customer = User::query()->updateOrCreate(
                ['email' => self::CUSTOMER_EMAIL],
                [
                    'name' => 'Demo Customer Arusantara',
                    'email_verified_at' => now(),
                    'password' => Hash::make(self::PASSWORD),
                    'role' => UserRole::Customer,
                ],
            );

            $makerUser = User::query()->updateOrCreate(
                ['email' => self::MAKER_EMAIL],
                [
                    'name' => 'Demo Panel Maker',
                    'email_verified_at' => now(),
                    'password' => Hash::make(self::PASSWORD),
                    'role' => UserRole::Maker,
                ],
            );

            $maker = MakerProfile::query()->updateOrCreate(
                ['user_id' => $makerUser->getKey()],
                [
                    'business_name' => 'Panel Nusantara Demo',
                    'description' => 'Panel maker demo untuk alur presentasi Arusantara.',
                    'phone' => '0812-0000-2026',
                    'city' => 'Jakarta',
                    'service_area' => ['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi'],
                    'verification_status' => VerificationStatus::Verified,
                    'verified_at' => now(),
                    'status' => MakerProfileStatus::Active,
                ],
            );

            if (Project::query()->where('code', self::PROJECT_CODE)->exists()) {
                return;
            }

            $project = Project::query()->create([
                'customer_id' => $customer->getKey(),
                'code' => self::PROJECT_CODE,
                'name' => 'Laundry Nusantara Demo',
                'description' => 'Skenario demo end-to-end Arusantara untuk preliminary panel configuration.',
                'business_category' => 'laundry',
            ]);

            $configuration = ProjectConfiguration::query()->create([
                'project_id' => $project->getKey(),
                'version' => 1,
                'created_by_user_id' => $customer->getKey(),
            ]);

            $scenario = [
                ['model' => 'WH6-8', 'variant' => '380-415v-3n-electric-7.8kw-50hz-basis', 'quantity' => 2],
                ['model' => 'WH6-11', 'variant' => '380-415v-3n-electric-7.6kw-50hz-basis', 'quantity' => 2],
                ['model' => 'TD6-10', 'variant' => '380-415v-3n-electric-8.4kw-50hz-basis', 'quantity' => 2],
                ['model' => 'TD6-14', 'variant' => '380-415v-3n-heat-pump-6.5kw-50hz-basis', 'quantity' => 1],
            ];

            foreach ($scenario as $index => $item) {
                $equipment = EquipmentModel::query()
                    ->where('brand', 'Electrolux Professional')
                    ->where('model', $item['model'])
                    ->where('specification_variant', $item['variant'])
                    ->firstOrFail();

                $configuration->lines()->create([
                    'equipment_category_id' => $equipment->equipment_category_id,
                    'equipment_model_id' => $equipment->getKey(),
                    'label' => $equipment->brand.' '.$equipment->model,
                    'quantity' => $item['quantity'],
                    'equipment_status' => EquipmentStatus::Existing,
                    'usage_profile' => ['simultaneous_use' => true],
                    'sort_order' => $index + 1,
                ]);
            }

            $configuration->update(['status' => ConfigurationStatus::Locked]);

            $snapshot = app(CalculateProjectConfiguration::class)->handle(
                $configuration,
                (int) $customer->getKey(),
            );

            $rfq = app(CreateRfqFromCalculationSnapshot::class)->handle(
                $snapshot,
                $customer,
                'RFQ-DEMO-001',
                'Panel Listrik Laundry Nusantara Demo',
                [
                    'scope' => 'preliminary_panel_configuration',
                    'customer_note' => 'Mohon verifikasi data engineering yang masih membutuhkan pemeriksaan sebelum final design.',
                    'preferred_maker_profile_ids' => [(int) $maker->getKey()],
                ],
                'Jakarta',
                now()->addDays(14),
            );

            $rfq = app(PublishRfq::class)->handle($rfq, $customer);

            $quotation = app(CreateQuotationDraft::class)->handle(
                $rfq,
                $maker,
                'QUO-DEMO-001',
            );

            $revision = app(UpdateQuotationDraft::class)->handle(
                $quotation,
                $maker,
                [
                    [
                        'description' => 'Panel enclosure, busbar, dan assembly utama',
                        'manufacturer' => 'Panel Nusantara Demo',
                        'part_number' => 'PND-PANEL-01',
                        'quantity' => 1,
                        'unit' => 'set',
                        'unit_price' => 9500000,
                    ],
                    [
                        'description' => 'Main protection dan distribution components',
                        'manufacturer' => 'Schneider Electric / equivalent',
                        'part_number' => null,
                        'quantity' => 1,
                        'unit' => 'set',
                        'unit_price' => 7500000,
                    ],
                ],
                3000000,
                2000000,
                0,
                500000,
                2420000,
                21,
                12,
                'Quote V1 demo. Final protection selection mengikuti hasil verifikasi engineering lapangan.',
                [
                    [
                        'baseline_reference' => 'technical_baseline.requires_verification',
                        'requested_specification' => 'Power factor dan final design current diverifikasi sebelum final protection selection.',
                        'proposed_specification' => 'Panel maker melakukan verifikasi nameplate/site sebelum final panel engineering.',
                        'reason' => 'Manufacturer datasheet pada preliminary calculation tidak mempublikasikan power factor.',
                        'price_impact' => 0,
                        'lead_time_impact_days' => 2,
                    ],
                ],
            );

            app(SubmitQuotationRevision::class)->handle($revision, $maker);
        }, 3);
    }
}
