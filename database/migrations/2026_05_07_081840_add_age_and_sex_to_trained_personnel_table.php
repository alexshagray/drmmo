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
        Schema::table('trained_personnel', function (Blueprint $table) {
            $table->integer('age')->nullable()->after('barangay');
            $table->string('sex')->nullable()->after('age');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trained_personnel', function (Blueprint $table) {
            $table->dropColumn(['age', 'sex']);
        });
    }
};
