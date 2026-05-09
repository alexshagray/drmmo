<?php

namespace App\Models;

use Database\Factories\HazardMapImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'barangay_id', 'title', 'image_path', 'description', 'latitude', 'longitude'])]
class HazardMapImage extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return HazardMapImageFactory::new();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
