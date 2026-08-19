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
            $table->unique(
                ['id', 'equipment_category_id'],
                'equipment_models_id_category_unique',
            );
        });

        Schema::create('configuration_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_configuration_id')->constrained('project_configurations')->cascadeOnDelete();
            $table->foreignId('equipment_category_id')->index()->constrained('equipment_categories')->restrictOnDelete();
            $table->foreignId('equipment_model_id')->nullable();
            $table->string('label');
            $table->unsignedInteger('quantity');
            $table->enum('equipment_status', ['existing', 'planned'])->default('existing');
            $table->jsonb('usage_profile')->nullable();
            $table->jsonb('customer_parameters')->nullable();
            $table->jsonb('equipment_snapshot');
            $table->enum('specification_confidence', ['unknown', 'low', 'medium', 'high'])->default('unknown');
            $table->text('notes')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['project_configuration_id', 'sort_order']);
            $table->index(['project_configuration_id', 'equipment_status']);
            $table->index(
                ['equipment_model_id', 'equipment_category_id'],
                'configuration_lines_model_category_index',
            );
            $table->foreign(
                ['equipment_model_id', 'equipment_category_id'],
                'configuration_lines_model_category_foreign',
            )
                ->references(['id', 'equipment_category_id'])
                ->on('equipment_models')
                ->restrictOnDelete();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE configuration_lines ADD CONSTRAINT configuration_lines_quantity_positive CHECK (quantity > 0 AND sort_order >= 0)');
            DB::statement("ALTER TABLE configuration_lines ADD CONSTRAINT configuration_lines_equipment_snapshot_object CHECK (jsonb_typeof(equipment_snapshot) = 'object')");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuration_lines');

        Schema::table('equipment_models', function (Blueprint $table) {
            $table->dropUnique('equipment_models_id_category_unique');
        });
    }
};
