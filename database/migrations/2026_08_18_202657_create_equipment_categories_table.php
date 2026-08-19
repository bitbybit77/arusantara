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
        Schema::create('equipment_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')
                ->nullable()
                ->index()
                ->constrained('equipment_categories')
                ->restrictOnDelete();
            $table->string('code', 100)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'inactive', 'archived'])
                ->default('active')
                ->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_categories');
    }
};
