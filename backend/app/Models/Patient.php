<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'prenom',
        'cin',
        'date_naissance',
        'sexe',
        'telephone',
        'emergency_contact',
        'adresse',
        'ville',
        'groupe_sanguin',
        'poids',
        'taille',
        'cause_insuffisance_renale',
        'nephrologue_id',
        'date_entree',
        'actif',
        'notes',
        'organisme',
        'insurance_number',
        'dialysis_group',
        'assigned_machine_id',
        'coverage_type',
        'coverage_expiration',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'date_entree' => 'date',
            'coverage_expiration' => 'date',
            'poids' => 'decimal:2',
            'taille' => 'integer',
            'actif' => 'boolean',
        ];
    }

    public function nephrologue(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nephrologue_id');
    }

    public function assignedMachine(): BelongsTo
    {
        return $this->belongsTo(Machine::class, 'assigned_machine_id');
    }

    public function seances(): HasMany
    {
        return $this->hasMany(Seance::class);
    }

    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class);
    }

    public function getNomCompletAttribute(): string
    {
        return trim("{$this->prenom} {$this->nom}");
    }
}
