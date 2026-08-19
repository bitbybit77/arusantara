<?php

namespace Database\Seeders;

use App\Equipment\EquipmentCatalogStatus;
use App\Models\Equipment\EquipmentCategory;
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
    }
}
