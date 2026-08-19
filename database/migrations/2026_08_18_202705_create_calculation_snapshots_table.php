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
        Schema::create('calculation_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_configuration_id')->constrained('project_configurations')->restrictOnDelete();
            $table->unsignedInteger('version');
            $table->string('calculator_version', 50);
            $table->char('input_hash', 64)->index();
            $table->decimal('connected_load_w', 14, 3)->nullable();
            $table->decimal('design_load_w', 14, 3)->nullable();
            $table->decimal('design_current_a', 14, 3)->nullable();
            $table->decimal('recommended_supply_v', 10, 3)->nullable();
            $table->enum('recommended_phase', ['single_phase', 'three_phase'])->nullable();
            $table->enum('result_status', ['calculated', 'assumed', 'estimated', 'requires_verification']);
            $table->jsonb('input_payload');
            $table->jsonb('result_payload');
            $table->jsonb('assumptions');
            $table->jsonb('warnings');
            $table->foreignId('calculated_by_user_id')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->timestamp('calculated_at');
            $table->timestamps();

            $table->unique(['project_configuration_id', 'version']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE calculation_snapshots ADD CONSTRAINT calculation_snapshots_version_positive CHECK (version > 0)');
            DB::statement('ALTER TABLE calculation_snapshots ADD CONSTRAINT calculation_snapshots_values_nonnegative CHECK ((connected_load_w IS NULL OR connected_load_w >= 0) AND (design_load_w IS NULL OR design_load_w >= 0) AND (design_current_a IS NULL OR design_current_a >= 0) AND (recommended_supply_v IS NULL OR recommended_supply_v > 0))');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calculation_snapshots');
    }
};
