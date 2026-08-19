<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rfqs', function (Blueprint $table) {
            $table->unique(['id', 'customer_id'], 'rfqs_id_customer_unique');
        });

        Schema::table('quotations', function (Blueprint $table) {
            $table->unique(
                ['id', 'rfq_id', 'maker_profile_id'],
                'quotations_id_rfq_maker_unique',
            );
        });

        Schema::table('deals', function (Blueprint $table) {
            $table->unique(
                ['id', 'customer_id', 'maker_profile_id'],
                'deals_id_customer_maker_unique',
            );
            $table->foreign(
                ['rfq_id', 'customer_id'],
                'deals_rfq_customer_context_foreign',
            )->references(['id', 'customer_id'])->on('rfqs')->restrictOnDelete();
            $table->foreign(
                ['quotation_id', 'rfq_id', 'maker_profile_id'],
                'deals_quotation_context_foreign',
            )->references(['id', 'rfq_id', 'maker_profile_id'])->on('quotations')->restrictOnDelete();
            $table->foreign(
                ['quotation_id', 'quotation_revision_id'],
                'deals_revision_context_foreign',
            )->references(['quotation_id', 'id'])->on('quotation_revisions')->restrictOnDelete();
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->foreign(
                ['rfq_id', 'customer_id'],
                'conversations_rfq_customer_context_foreign',
            )->references(['id', 'customer_id'])->on('rfqs')->restrictOnDelete();
            $table->foreign(
                ['quotation_id', 'rfq_id', 'maker_profile_id'],
                'conversations_quotation_context_foreign',
            )->references(['id', 'rfq_id', 'maker_profile_id'])->on('quotations')->restrictOnDelete();
        });

        Schema::table('maker_reviews', function (Blueprint $table) {
            $table->foreign(
                ['deal_id', 'customer_id', 'maker_profile_id'],
                'maker_reviews_deal_context_foreign',
            )->references(['id', 'customer_id', 'maker_profile_id'])->on('deals')->restrictOnDelete();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(<<<'SQL'
                ALTER TABLE technical_deviations
                ADD CONSTRAINT technical_deviations_response_coherent CHECK (
                    (status = 'pending' AND responded_at IS NULL)
                    OR (status IN ('accepted', 'rejected') AND responded_at IS NOT NULL)
                )
                SQL);
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE technical_deviations DROP CONSTRAINT technical_deviations_response_coherent');
        }

        Schema::table('maker_reviews', function (Blueprint $table) {
            $table->dropForeign('maker_reviews_deal_context_foreign');
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign('conversations_quotation_context_foreign');
            $table->dropForeign('conversations_rfq_customer_context_foreign');
        });

        Schema::table('deals', function (Blueprint $table) {
            $table->dropForeign('deals_revision_context_foreign');
            $table->dropForeign('deals_quotation_context_foreign');
            $table->dropForeign('deals_rfq_customer_context_foreign');
            $table->dropUnique('deals_id_customer_maker_unique');
        });

        Schema::table('quotations', function (Blueprint $table) {
            $table->dropUnique('quotations_id_rfq_maker_unique');
        });

        Schema::table('rfqs', function (Blueprint $table) {
            $table->dropUnique('rfqs_id_customer_unique');
        });
    }
};
