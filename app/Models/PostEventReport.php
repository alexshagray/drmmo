<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostEventReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'incident_id',
        'title',
        'summary',
        'actions_taken',
        'lessons_learned',
        'recommendations',
        'status',
        'created_by',
    ];

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
