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
        Schema::create('equipment_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipment_model_id')
                ->constrained('equipment_models')
                ->cascadeOnDelete();
            $table->string('source_name');
            $table->text('source_url')->nullable();
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])
                ->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by_user_id')
                ->nullable()
                ->index()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['equipment_model_id', 'verification_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_sources');
    }
};
