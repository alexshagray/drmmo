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
        Schema::table('incidents', function (Blueprint $table) {
            if (!Schema::hasColumn('incidents', 'age')) {
                $table->string('age')->nullable()->after('title');
            }
            if (!Schema::hasColumn('incidents', 'gender')) {
                $table->string('gender')->nullable()->after('age');
            }
            if (!Schema::hasColumn('incidents', 'contact_number')) {
                $table->string('contact_number')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('incidents', 'responders')) {
                $table->string('responders')->nullable()->after('location_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incidents', function (Blueprint $table) {
            $columns = ['age', 'gender', 'contact_number', 'responders'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('incidents', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
