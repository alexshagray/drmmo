<?php

namespace App\Models;

use Database\Factories\BarangayFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'description', 'latitude', 'longitude', 'image_path', 'population', 'hazard_type'])]
class Barangay extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return BarangayFactory::new();
    }

    public function hazardImages()
    {
        return $this->hasMany(HazardMapImage::class);
    }
}
