<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainedPersonnel extends Model
{
    use HasFactory;

    protected $table = 'trained_personnel';

    protected $fillable = [
        'name',
        'contact_number',
        'specialization',
        'barangay',
        'age',
        'sex',
        'status',
        'notes',
    ];
}
