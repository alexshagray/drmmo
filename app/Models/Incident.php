<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Incident extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'age',
        'gender',
        'civil_status',
        'contact_number',
        'description',
        'type',
        'severity',
        'status',
        'latitude',
        'longitude',
        'location_name',
        'responders',
        'received_by',
        'reported_at',
        'resolved_at',
        'reported_by',
        'is_verified',
        'verified_at',
        'verified_by',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'reported_at' => 'datetime',
        'resolved_at' => 'datetime',
        'verified_at' => 'datetime',
        'is_verified' => 'boolean',
    ];

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function dispatches(): HasMany
    {
        return $this->hasMany(ResourceDispatch::class);
    }

    public function postEventReports(): HasMany
    {
        return $this->hasMany(PostEventReport::class);
    }
}
