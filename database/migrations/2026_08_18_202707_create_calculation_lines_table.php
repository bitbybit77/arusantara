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
        Schema::create('calculation_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calculation_snapshot_id')->constrained('calculation_snapshots')->cascadeOnDelete();
            $table->foreignId('source_configuration_line_id')->nullable()->index()->constrained('configuration_lines')->restrictOnDelete();
            $table->string('line_code', 100);
            $table->enum('line_type', ['load', 'protection', 'panel_component']);
            $table->string('description');
            $table->decimal('quantity', 12, 3)->nullable();
            $table->decimal('rated_power_w', 14, 3)->nullable();
            $table->decimal('design_power_w', 14, 3)->nullable();
            $table->decimal('design_current_a', 14, 3)->nullable();
            $table->enum('phase', ['single_phase', 'three_phase'])->nullable();
            $table->string('circuit_group', 100)->nullable();
            $table->string('recommended_protection')->nullable();
            $table->decimal('recommended_rating_a', 10, 3)->nullable();
            $table->enum('result_status', ['calculated', 'assumed', 'estimated', 'requires_verification']);
            $table->string('education_reference')->nullable();
            $table->jsonb('calculation_detail')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['calculation_snapshot_id', 'line_code']);
            $table->index(['calculation_snapshot_id', 'line_type']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE calculation_lines ADD CONSTRAINT calculation_lines_values_nonnegative CHECK ((quantity IS NULL OR quantity > 0) AND (rated_power_w IS NULL OR rated_power_w >= 0) AND (design_power_w IS NULL OR design_power_w >= 0) AND (design_current_a IS NULL OR design_current_a >= 0) AND (recommended_rating_a IS NULL OR recommended_rating_a > 0) AND sort_order >= 0)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calculation_lines');
    }
};
