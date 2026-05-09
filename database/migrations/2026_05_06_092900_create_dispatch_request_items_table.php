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
        Schema::create('dispatch_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispatch_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->unique(['dispatch_request_id', 'inventory_item_id'], 'dr_di_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatch_request_items');
    }
};
