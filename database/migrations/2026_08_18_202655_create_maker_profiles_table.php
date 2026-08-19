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
        Schema::create('maker_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->text('description')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('city', 100)->nullable();
            $table->jsonb('service_area')->nullable();
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])
                ->default('pending')
                ->index();
            $table->timestamp('verified_at')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamps();

            $table->index(['status', 'city']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maker_profiles');
    }
};
