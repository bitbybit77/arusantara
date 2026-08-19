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
        Schema::create('education_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_user_id')->nullable()->index()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category', 100)->index();
            $table->text('summary')->nullable();
            $table->longText('content');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_articles');
    }
};
