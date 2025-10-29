<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('uploads', function (Blueprint $table) {
            $table->timestamp('photo_taken_at')->nullable()->after('metadata');
            $table->boolean('is_camera_photo')->default(false)->after('photo_taken_at');
        });
    }

    public function down(): void
    {
        Schema::table('uploads', function (Blueprint $table) {
            $table->dropColumn(['photo_taken_at', 'is_camera_photo']);
        });
    }
};