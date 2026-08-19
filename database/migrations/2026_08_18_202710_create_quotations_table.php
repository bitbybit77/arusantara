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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->constrained()->restrictOnDelete();
            $table->foreignId('maker_profile_id')->constrained()->restrictOnDelete();
            $table->string('number', 50)->unique();
            $table->enum('status', ['draft', 'submitted', 'negotiating', 'accepted', 'rejected', 'withdrawn'])->default('draft');
            $table->timestamps();

            $table->unique(['rfq_id', 'maker_profile_id']);
            $table->index(['rfq_id', 'status']);
            $table->index(['maker_profile_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
