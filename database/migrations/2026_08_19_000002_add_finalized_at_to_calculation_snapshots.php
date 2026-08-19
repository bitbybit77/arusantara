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
        Schema::table('calculation_snapshots', function (Blueprint $table) {
            $table->timestamp('finalized_at')->nullable();
        });

        DB::table('calculation_snapshots')
            ->whereNull('finalized_at')
            ->update(['finalized_at' => DB::raw('calculated_at')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_snapshots', function (Blueprint $table) {
            $table->dropColumn('finalized_at');
        });
    }
};
