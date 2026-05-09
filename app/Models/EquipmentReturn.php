<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipmentReturn extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_name',
        'quantity',
        'condition',
        'remarks',
        'notification_id',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
