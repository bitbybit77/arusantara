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
        Schema::create('equipment_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_category_id')
                ->constrained('equipment_categories')
                ->restrictOnDelete();
            $table->string('brand', 100);
            $table->string('model', 150);
            $table->string('equipment_type', 100)->nullable();
            $table->decimal('rated_power_w', 12, 3)->nullable();
            $table->decimal('voltage_v', 8, 2)->nullable();
            $table->enum('phase', ['single_phase', 'three_phase'])->nullable();
            $table->decimal('power_factor', 5, 4)->nullable();
            $table->decimal('efficiency', 5, 4)->nullable();
            $table->enum('specification_confidence', ['unknown', 'low', 'medium', 'high'])
                ->default('unknown');
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->timestamps();

            $table->unique(['equipment_category_id', 'brand', 'model']);
            $table->index(['equipment_category_id', 'status']);
            $table->index(['status', 'specification_confidence']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE equipment_models ADD CONSTRAINT equipment_models_rated_power_w_non_negative CHECK (rated_power_w IS NULL OR rated_power_w >= 0)');
            DB::statement('ALTER TABLE equipment_models ADD CONSTRAINT equipment_models_voltage_v_positive CHECK (voltage_v IS NULL OR voltage_v > 0)');
            DB::statement('ALTER TABLE equipment_models ADD CONSTRAINT equipment_models_power_factor_range CHECK (power_factor IS NULL OR (power_factor > 0 AND power_factor <= 1))');
            DB::statement('ALTER TABLE equipment_models ADD CONSTRAINT equipment_models_efficiency_range CHECK (efficiency IS NULL OR (efficiency > 0 AND efficiency <= 1))');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_models');
    }
};
