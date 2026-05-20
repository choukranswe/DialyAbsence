<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbsenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'patient' => [
                'id' => $this->patient?->id,
                'nom' => $this->patient?->nom,
                'prenom' => $this->patient?->prenom,
                'nom_complet' => $this->patient?->nom_complet,
                'cin' => $this->patient?->cin,
            ],
            'seance_id' => $this->seance_id,
            'seance' => $this->seance ? [
                'id' => $this->seance->id,
                'date_seance' => $this->seance->date_seance?->toDateString(),
                'heure_debut' => substr((string) $this->seance->heure_debut, 0, 5),
            ] : null,
            'date_absence' => $this->date_absence?->toDateString(),
            'motif' => $this->motif,
            'justifiee' => (bool) $this->justifiee,
            'notes' => $this->notes,
            'declared_by' => $this->declared_by,
            'declarant' => $this->declarant ? [
                'id' => $this->declarant->id,
                'nom_complet' => $this->declarant->nom_complet,
            ] : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
