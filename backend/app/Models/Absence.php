<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'seance_id',
        'date_absence',
        'motif',
        'justifiee',
        'notes',
        'declared_by',
    ];

    protected function casts(): array
    {
        return [
            'date_absence' => 'date',
            'justifiee' => 'boolean',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function seance(): BelongsTo
    {
        return $this->belongsTo(Seance::class);
    }

    public function declarant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'declared_by');
    }
}
