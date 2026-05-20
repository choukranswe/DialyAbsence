<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seance extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'machine_id',
        'infirmier_id',
        'date_seance',
        'heure_debut',
        'heure_fin',
        'duree_minutes',
        'statut',
        'tension_avant',
        'tension_apres',
        'poids_avant',
        'poids_apres',
        'poids_sec',
        'observations',
    ];

    protected function casts(): array
    {
        return [
            'date_seance' => 'date',
            'duree_minutes' => 'integer',
            'poids_avant' => 'decimal:2',
            'poids_apres' => 'decimal:2',
            'poids_sec' => 'decimal:2',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function infirmier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'infirmier_id');
    }
}
