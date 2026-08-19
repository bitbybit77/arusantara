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
        Schema::table('quotations', function (Blueprint $table) {
            $table->foreignId('current_revision_id')
                ->nullable()
                ->after('status')
                ->index();

            $table->foreign(['id', 'current_revision_id'], 'quotations_current_revision_ownership_foreign')
                ->references(['quotation_id', 'id'])
                ->on('quotation_revisions')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->dropForeign('quotations_current_revision_ownership_foreign');
            $table->dropColumn('current_revision_id');
        });
    }
};
