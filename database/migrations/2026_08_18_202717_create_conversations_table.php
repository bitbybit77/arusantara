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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->constrained('rfqs')->restrictOnDelete();
            $table->foreignId('quotation_id')->nullable()->unique()->constrained('quotations')->restrictOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('maker_profile_id')->constrained()->restrictOnDelete();
            $table->enum('status', ['active', 'closed'])->default('active');
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->unique(['rfq_id', 'maker_profile_id']);
            $table->index(['customer_id', 'status']);
            $table->index(['maker_profile_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
