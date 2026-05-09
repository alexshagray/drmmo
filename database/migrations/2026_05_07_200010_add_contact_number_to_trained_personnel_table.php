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
            if (!Schema::hasColumn('trained_personnel', 'contact_number')) {
                $table->string('contact_number', 11)->nullable()->after('name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trained_personnel', function (Blueprint $table) {
            if (Schema::hasColumn('trained_personnel', 'contact_number')) {
                $table->dropColumn('contact_number');
            }
        });
    }
};
