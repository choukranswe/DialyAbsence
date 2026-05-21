<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Nurse extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'phone',
        'shift',
        'status',
        'notes',
    ];

    public function seances(): HasMany
    {
        return $this->hasMany(Seance::class);
    }

    public function leaves(): HasMany
    {
        return $this->hasMany(NurseLeave::class);
    }
}
