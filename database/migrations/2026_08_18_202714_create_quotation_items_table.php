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
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_revision_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['component', 'fabrication', 'installation', 'service', 'other']);
            $table->string('description');
            $table->string('manufacturer')->nullable();
            $table->string('part_number')->nullable();
            $table->decimal('quantity', 14, 3);
            $table->string('unit', 30);
            $table->decimal('unit_price', 19, 2);
            $table->decimal('line_total', 19, 2);
            $table->jsonb('specification')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['quotation_revision_id', 'type']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE quotation_items ADD CONSTRAINT quotation_items_values_positive CHECK (quantity > 0 AND unit_price >= 0 AND line_total >= 0 AND sort_order >= 0)');
            DB::statement("ALTER TABLE quotation_items ADD CONSTRAINT quotation_items_specification_object CHECK (specification IS NULL OR jsonb_typeof(specification) = 'object')");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_items');
    }
};
