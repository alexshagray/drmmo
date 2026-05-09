<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->foreignId('staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('transaction_type', ['Stock In', 'Stock Out', 'Consumed', 'Damaged', 'Lost']);
            $table->integer('quantity');
            $table->foreignId('reference_incident_id')->nullable()->constrained('incidents')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('transaction_date')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
