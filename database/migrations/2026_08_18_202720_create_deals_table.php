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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfq_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('quotation_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('quotation_revision_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('maker_profile_id')->constrained()->restrictOnDelete();
            $table->string('number', 50)->unique();
            $table->enum('status', ['accepted', 'in_progress', 'completed', 'cancelled', 'closed'])->default('accepted');
            $table->char('currency_code', 3);
            $table->decimal('agreed_value', 19, 2);
            $table->unsignedInteger('lead_time_days')->nullable();
            $table->unsignedInteger('warranty_months')->nullable();
            $table->jsonb('technical_snapshot');
            $table->jsonb('commercial_snapshot');
            $table->timestamp('accepted_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['maker_profile_id', 'status']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE deals ADD CONSTRAINT deals_currency_code_format CHECK (currency_code ~ '^[A-Z]{3}$')");
            DB::statement('ALTER TABLE deals ADD CONSTRAINT deals_values_nonnegative CHECK (agreed_value >= 0 AND (lead_time_days IS NULL OR lead_time_days >= 0) AND (warranty_months IS NULL OR warranty_months >= 0))');
            DB::statement("ALTER TABLE deals ADD CONSTRAINT deals_snapshots_objects CHECK (jsonb_typeof(technical_snapshot) = 'object' AND jsonb_typeof(commercial_snapshot) = 'object')");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
