<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Machine extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'marque',
        'modele',
        'statut',
        'date_installation',
        'date_derniere_maintenance',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_installation' => 'date',
            'date_derniere_maintenance' => 'date',
        ];
    }

    public function seances(): HasMany
    {
        return $this->hasMany(Seance::class);
    }
}
