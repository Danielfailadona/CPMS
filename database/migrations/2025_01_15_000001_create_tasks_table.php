<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->date('due_date')->nullable();
            $table->foreignId('worker_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('foreman_id')->constrained('users')->onDelete('cascade');
            $table->text('foreman_notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('priority');
            $table->index('worker_id');
            $table->index('foreman_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};