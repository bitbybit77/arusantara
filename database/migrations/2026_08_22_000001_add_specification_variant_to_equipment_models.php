<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('equipment_models', function (Blueprint $table) {
            $table->dropUnique(['equipment_category_id', 'brand', 'model']);

            $table->string('specification_variant', 150)
                ->default('standard')
                ->after('equipment_type');
            $table->decimal('frequency_hz', 6, 2)
                ->nullable()
                ->after('voltage_v');
            $table->decimal('rated_current_a', 10, 3)
                ->nullable()
                ->after('frequency_hz');

            $table->unique(
                ['equipment_category_id', 'brand', 'model', 'specification_variant'],
                'equipment_models_category_brand_model_variant_unique',
            );
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE equipment_models ADD CONSTRAINT equipment_models_frequency_hz_positive CHECK (frequency_hz IS NULL OR frequency_hz > 0)');
            DB::statement('ALTER TABLE equipment_models ADD CONSTRAINT equipment_models_rated_current_a_non_negative CHECK (rated_current_a IS NULL OR rated_current_a >= 0)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipment_models', function (Blueprint $table) {
            $table->dropUnique('equipment_models_category_brand_model_variant_unique');
            $table->dropColumn(['specification_variant', 'frequency_hz', 'rated_current_a']);
            $table->unique(['equipment_category_id', 'brand', 'model']);
        });
    }
};
