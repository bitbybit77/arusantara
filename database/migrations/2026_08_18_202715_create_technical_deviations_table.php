<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('technical_deviations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_revision_id')->constrained()->cascadeOnDelete();
            $table->string('baseline_reference');
            $table->text('requested_specification');
            $table->text('proposed_specification');
            $table->text('reason');
            $table->decimal('price_impact', 19, 2)->default(0);
            $table->integer('lead_time_impact_days')->default(0);
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['quotation_revision_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('technical_deviations');
    }
};
