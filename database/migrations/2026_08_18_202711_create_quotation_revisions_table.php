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
        Schema::create('quotation_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('revision_number');
            $table->char('currency_code', 3)->default('IDR');
            $table->decimal('component_cost', 19, 2)->default(0);
            $table->decimal('fabrication_cost', 19, 2)->default(0);
            $table->decimal('installation_cost', 19, 2)->default(0);
            $table->decimal('other_cost', 19, 2)->default(0);
            $table->decimal('subtotal', 19, 2)->default(0);
            $table->decimal('discount_amount', 19, 2)->default(0);
            $table->decimal('tax_amount', 19, 2)->default(0);
            $table->decimal('grand_total', 19, 2)->default(0);
            $table->unsignedInteger('lead_time_days')->nullable();
            $table->unsignedInteger('warranty_months')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['quotation_id', 'revision_number']);
            $table->unique(['quotation_id', 'id']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE quotation_revisions ADD CONSTRAINT quotation_revisions_revision_number_positive CHECK (revision_number > 0)');
            DB::statement("ALTER TABLE quotation_revisions ADD CONSTRAINT quotation_revisions_currency_code_format CHECK (currency_code ~ '^[A-Z]{3}$')");
            DB::statement('ALTER TABLE quotation_revisions ADD CONSTRAINT quotation_revisions_amounts_nonnegative CHECK (component_cost >= 0 AND fabrication_cost >= 0 AND installation_cost >= 0 AND other_cost >= 0 AND subtotal >= 0 AND discount_amount >= 0 AND tax_amount >= 0 AND grand_total >= 0)');
            DB::statement('ALTER TABLE quotation_revisions ADD CONSTRAINT quotation_revisions_totals_consistent CHECK (subtotal = component_cost + fabrication_cost + installation_cost + other_cost AND grand_total = subtotal - discount_amount + tax_amount)');
            DB::statement('ALTER TABLE quotation_revisions ADD CONSTRAINT quotation_revisions_durations_nonnegative CHECK ((lead_time_days IS NULL OR lead_time_days >= 0) AND (warranty_months IS NULL OR warranty_months >= 0))');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_revisions');
    }
};
