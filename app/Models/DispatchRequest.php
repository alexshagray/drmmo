<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DispatchRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_name',
        'date_time',
        'category',
        'items',
        'status',
    ];

    protected $casts = [
        'items' => 'array',
        'date_time' => 'datetime',
    ];
}
