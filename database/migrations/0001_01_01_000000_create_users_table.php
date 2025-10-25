<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('user_type', ['admin', 'client', 'foreman', 'ceo', 'manager', 'worker'])->default('client');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_authorized')->default(false); // Authorization status
            $table->text('authorization_notes')->nullable(); // Reason for authorization status
            $table->timestamp('authorized_at')->nullable(); // When user was authorized
            $table->foreignId('authorized_by')->nullable()->constrained('users'); // Who authorized the user
            $table->rememberToken();
            $table->timestamps();
        });

        // Insert ONLY the default admin user (pre-authorized)
        DB::table('users')->insert([
            'name' => 'Administrator',
            'email' => 'admin@cpms.com',
            'password' => Hash::make('admin123'),
            'user_type' => 'admin',
            'is_active' => true,
            'is_authorized' => true, // Admin is pre-authorized
            'authorization_notes' => 'Default system administrator',
            'authorized_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};