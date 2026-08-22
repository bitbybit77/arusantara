<?php

namespace Database\Seeders;

use App\Equipment\ElectricalPhase;
use App\Equipment\EquipmentCatalogStatus;
use App\Equipment\SpecificationConfidence;
use App\Models\Equipment\EquipmentCategory;
use App\Models\Equipment\EquipmentModel;
use App\VerificationStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EquipmentCatalogSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['code' => 'washing-machine', 'name' => 'Washing Machine'],
            ['code' => 'dryer', 'name' => 'Dryer'],
            ['code' => 'air-conditioner', 'name' => 'Air Conditioner'],
            ['code' => 'pump', 'name' => 'Pump'],
            ['code' => 'lighting', 'name' => 'Lighting'],
            ['code' => 'general-socket', 'name' => 'General Socket'],
            ['code' => 'compressor', 'name' => 'Compressor'],
        ];

        foreach ($categories as $category) {
            EquipmentCategory::query()->updateOrCreate(
                ['code' => $category['code']],
                [
                    'name' => $category['name'],
                    'status' => EquipmentCatalogStatus::Active,
                ],
            );
        }

        $this->seedLaundryMvpDataset();
    }

    private function seedLaundryMvpDataset(): void
    {
        $washingMachine = EquipmentCategory::query()
            ->where('code', 'washing-machine')
            ->firstOrFail();
        $dryer = EquipmentCategory::query()
            ->where('code', 'dryer')
            ->firstOrFail();

        $models = [
            [
                'category' => $washingMachine,
                'brand' => 'Electrolux Professional',
                'model' => 'WH6-6',
                'equipment_type' => 'Commercial front-load washer 6 kg',
                'specification_variant' => '380-415v-3n-electric-4.6kw-50hz-basis',
                'rated_power_w' => 4600,
                'voltage_v' => 380,
                'frequency_hz' => 50,
                'rated_current_a' => null,
                'phase' => ElectricalPhase::ThreePhase,
                'power_factor' => null,
                'efficiency' => null,
                'source_name' => 'Electrolux Professional WH6-6 Product Data Sheet',
                'source_url' => 'https://tools.electroluxprofessional.com/Mirror/Doc/ELS/PDS/PDS_WH6-6_438913951_EN.pdf?version=1753099067',
                'source_notes' => 'Official manufacturer data sheet. Source electrical row: electric heated, 380-415V 3N~, 50/60 Hz, 4.4 kW heating, 4.6 kW total power, 10 A recommended fuse. Catalog uses 380 V and 50 Hz as the explicit calculation basis within the published supported range. Power factor is not published and remains null.',
            ],
            [
                'category' => $washingMachine,
                'brand' => 'Electrolux Professional',
                'model' => 'WH6-8',
                'equipment_type' => 'Commercial front-load washer 8 kg',
                'specification_variant' => '380-415v-3n-electric-7.8kw-50hz-basis',
                'rated_power_w' => 7800,
                'voltage_v' => 380,
                'frequency_hz' => 50,
                'rated_current_a' => null,
                'phase' => ElectricalPhase::ThreePhase,
                'power_factor' => null,
                'efficiency' => null,
                'source_name' => 'Electrolux Professional WH6-8 Product Data Sheet',
                'source_url' => 'https://tools.electroluxprofessional.com/Mirror/Doc/ELS/PDS/PDS_WH6-8_438908681_EN.pdf',
                'source_notes' => 'Official manufacturer data sheet. Source electrical row supports 380-415V 3N/3~, 50/60 Hz, 7.5 kW heating and 7.8 kW total power. Catalog uses 380 V and 50 Hz as the explicit calculation basis within the published supported range. Power factor is not published and remains null.',
            ],
            [
                'category' => $washingMachine,
                'brand' => 'Electrolux Professional',
                'model' => 'WH6-11',
                'equipment_type' => 'Commercial front-load washer 11 kg',
                'specification_variant' => '380-415v-3n-electric-7.6kw-50hz-basis',
                'rated_power_w' => 7600,
                'voltage_v' => 380,
                'frequency_hz' => 50,
                'rated_current_a' => null,
                'phase' => ElectricalPhase::ThreePhase,
                'power_factor' => null,
                'efficiency' => null,
                'source_name' => 'Electrolux Professional WH6-11 Product Data Sheet',
                'source_url' => 'https://tools.electroluxprofessional.com/Mirror/Doc/ELS/PDS/PDS_WH6-11_438908682_EN.pdf',
                'source_notes' => 'Official manufacturer data sheet. Source electrical row supports 380-415V 3/3N~, 50/60 Hz, 7.5 kW heating and 7.6 kW total power. Catalog uses 380 V and 50 Hz as the explicit calculation basis within the published supported range. Power factor is not published and remains null.',
            ],
            [
                'category' => $dryer,
                'brand' => 'Electrolux Professional',
                'model' => 'TD6-10',
                'equipment_type' => 'Commercial tumble dryer 10 kg',
                'specification_variant' => '380-415v-3n-electric-8.4kw-50hz-basis',
                'rated_power_w' => 8400,
                'voltage_v' => 380,
                'frequency_hz' => 50,
                'rated_current_a' => null,
                'phase' => ElectricalPhase::ThreePhase,
                'power_factor' => null,
                'efficiency' => null,
                'source_name' => 'Electrolux Professional TD6-10 Product Data Sheet',
                'source_url' => 'https://tools.electroluxprofessional.com/Mirror/Doc/ELS/PDS/PDS_TD6-10_438900697_EN.pdf?version=1749642200',
                'source_notes' => 'Official manufacturer data sheet. Source electrical row supports 380-415V 3N/3~, 50/60 Hz, 8.0 kW heating and 8.4 kW total power. Catalog uses 380 V and 50 Hz as the explicit calculation basis within the published supported range. Power factor is not published and remains null.',
            ],
            [
                'category' => $dryer,
                'brand' => 'Electrolux Professional',
                'model' => 'TD6-14',
                'equipment_type' => 'Commercial tumble dryer 14 kg',
                'specification_variant' => '380-415v-3n-electric-10kw-50hz-basis',
                'rated_power_w' => 10000,
                'voltage_v' => 380,
                'frequency_hz' => 50,
                'rated_current_a' => null,
                'phase' => ElectricalPhase::ThreePhase,
                'power_factor' => null,
                'efficiency' => null,
                'source_name' => 'Electrolux Professional TD6-14 Product Data Sheet',
                'source_url' => 'https://tools.electroluxprofessional.com/Mirror/Doc/ELS/PDS/PDS_TD6-14_471151360_EN.pdf',
                'source_notes' => 'Official manufacturer data sheet. Source electrical row supports 380-415V 3N~, 50/60 Hz, 9.0 kW heating and 10.0 kW total power. Catalog uses 380 V and 50 Hz as the explicit calculation basis within the published supported range. Power factor is not published and remains null.',
            ],
            [
                'category' => $dryer,
                'brand' => 'Electrolux Professional',
                'model' => 'TD6-14',
                'equipment_type' => 'Commercial heat-pump tumble dryer 14 kg',
                'specification_variant' => '380-415v-3n-heat-pump-6.5kw-50hz-basis',
                'rated_power_w' => 6500,
                'voltage_v' => 380,
                'frequency_hz' => 50,
                'rated_current_a' => null,
                'phase' => ElectricalPhase::ThreePhase,
                'power_factor' => null,
                'efficiency' => null,
                'source_name' => 'Electrolux Professional TD6-14 Heat Pump Product Data Sheet',
                'source_url' => 'https://tools.electroluxprofessional.com/Mirror/Doc/ELS/PDS/PS_471151361EN_TD6-14%20HP_EN.pdf',
                'source_notes' => 'Official manufacturer data sheet. Source electrical row supports 380-415V 3/3N~, 50/60 Hz and 6.5 kW total power for the heat-pump configuration. Catalog uses 380 V and 50 Hz as the explicit calculation basis within the published supported range. Power factor is not published and remains null.',
            ],
        ];

        foreach ($models as $data) {
            /** @var EquipmentCategory $category */
            $category = $data['category'];

            $equipmentModel = EquipmentModel::query()->updateOrCreate(
                [
                    'equipment_category_id' => $category->id,
                    'brand' => $data['brand'],
                    'model' => $data['model'],
                    'specification_variant' => $data['specification_variant'],
                ],
                [
                    'equipment_type' => $data['equipment_type'],
                    'rated_power_w' => $data['rated_power_w'],
                    'voltage_v' => $data['voltage_v'],
                    'frequency_hz' => $data['frequency_hz'],
                    'rated_current_a' => $data['rated_current_a'],
                    'phase' => $data['phase'],
                    'power_factor' => $data['power_factor'],
                    'efficiency' => $data['efficiency'],
                    'specification_confidence' => SpecificationConfidence::High,
                    'status' => EquipmentCatalogStatus::Active,
                ],
            );

            $equipmentModel->sources()->updateOrCreate(
                [
                    'source_name' => $data['source_name'],
                    'source_url' => $data['source_url'],
                ],
                [
                    'verification_status' => VerificationStatus::Pending,
                    'verified_at' => null,
                    'verified_by_user_id' => null,
                    'notes' => $data['source_notes'],
                ],
            );
        }
    }
}
