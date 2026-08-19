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
        Schema::table('configuration_lines', function (Blueprint $table) {
            $table->enum('specification_basis', ['exact', 'category_based', 'estimated'])
                ->default('estimated');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuration_lines', function (Blueprint $table) {
            $table->dropColumn('specification_basis');
        });
    }
};
