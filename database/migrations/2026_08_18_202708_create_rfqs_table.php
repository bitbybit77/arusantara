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
        Schema::create('rfqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->restrictOnDelete();
            $table->foreignId('calculation_snapshot_id')->index()->constrained()->restrictOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->string('number', 50)->unique();
            $table->string('title');
            $table->enum('status', ['draft', 'open', 'negotiating', 'awarded', 'closed', 'cancelled'])->default('draft');
            $table->jsonb('requirements');
            $table->string('installation_location')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index(['status', 'due_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rfqs');
    }
};
