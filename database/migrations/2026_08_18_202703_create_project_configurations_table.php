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
        Schema::create('project_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->restrictOnDelete();
            $table->unsignedInteger('version');
            $table->enum('status', ['draft', 'ready', 'locked', 'superseded'])->default('draft');
            $table->foreignId('created_by_user_id')->index()->constrained('users')->restrictOnDelete();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'version']);
            $table->index(['project_id', 'status']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE project_configurations ADD CONSTRAINT project_configurations_version_positive CHECK (version > 0)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_configurations');
    }
};
