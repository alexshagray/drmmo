<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'quantity',
        'min_stock_level',
        'condition',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function dispatches(): HasMany
    {
        return $this->hasMany(ResourceDispatch::class);
    }
}
