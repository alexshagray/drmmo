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
            $table->dropColumn(['certification', 'certification_date', 'expiration_date']);
            $table->string('barangay')->after('specialization');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trained_personnel', function (Blueprint $table) {
            $table->dropColumn('barangay');
            $table->string('certification')->nullable();
            $table->date('certification_date')->nullable();
            $table->date('expiration_date')->nullable();
        });
    }
};
