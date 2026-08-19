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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->restrictOnDelete();
            $table->foreignId('sender_user_id')->index()->constrained('users')->restrictOnDelete();
            $table->text('message');
            $table->string('attachment_path')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE INDEX messages_unread_by_conversation_index ON messages (conversation_id) WHERE read_at IS NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
