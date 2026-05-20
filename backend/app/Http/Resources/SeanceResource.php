<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeanceResource extends JsonResource
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
            'machine_id' => $this->machine_id,
            'machine' => [
                'id' => $this->machine?->id,
                'numero' => $this->machine?->numero,
                'statut' => $this->machine?->statut,
            ],
            'infirmier_id' => $this->infirmier_id,
            'infirmier' => $this->infirmier ? [
                'id' => $this->infirmier->id,
                'nom_complet' => $this->infirmier->nom_complet,
            ] : null,
            'date_seance' => $this->date_seance?->toDateString(),
            'heure_debut' => substr((string) $this->heure_debut, 0, 5),
            'heure_fin' => substr((string) $this->heure_fin, 0, 5),
            'duree_minutes' => $this->duree_minutes,
            'statut' => $this->statut,
            'tension_avant' => $this->tension_avant,
            'tension_apres' => $this->tension_apres,
            'poids_avant' => $this->poids_avant,
            'poids_apres' => $this->poids_apres,
            'poids_sec' => $this->poids_sec,
            'observations' => $this->observations,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
