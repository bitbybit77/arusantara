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
        Schema::create('maker_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->unique()->constrained('deals')->restrictOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('maker_profile_id')->constrained()->restrictOnDelete();
            $table->unsignedTinyInteger('overall_rating');
            $table->unsignedTinyInteger('quality_rating');
            $table->unsignedTinyInteger('specification_compliance_rating');
            $table->unsignedTinyInteger('communication_rating');
            $table->unsignedTinyInteger('delivery_rating');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index(['maker_profile_id', 'created_at']);
            $table->index(['customer_id', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(<<<'SQL'
                ALTER TABLE maker_reviews
                ADD CONSTRAINT maker_reviews_ratings_check CHECK (
                    overall_rating BETWEEN 1 AND 5
                    AND quality_rating BETWEEN 1 AND 5
                    AND specification_compliance_rating BETWEEN 1 AND 5
                    AND communication_rating BETWEEN 1 AND 5
                    AND delivery_rating BETWEEN 1 AND 5
                )
                SQL);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maker_reviews');
    }
};
