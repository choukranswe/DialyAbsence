<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'nom_complet' => $this->nom_complet,
            'cin' => $this->cin,
            'date_naissance' => $this->date_naissance?->toDateString(),
            'age' => $this->date_naissance?->age,
            'sexe' => $this->sexe,
            'telephone' => $this->telephone,
            'emergency_contact' => $this->emergency_contact,
            'adresse' => $this->adresse,
            'ville' => $this->ville,
            'groupe_sanguin' => $this->groupe_sanguin,
            'poids' => $this->poids,
            'taille' => $this->taille,
            'cause_insuffisance_renale' => $this->cause_insuffisance_renale,
            'nephrologue_id' => $this->nephrologue_id,
            'nephrologue' => $this->whenLoaded('nephrologue', fn () => [
                'id' => $this->nephrologue?->id,
                'nom_complet' => $this->nephrologue?->nom_complet,
                'email' => $this->nephrologue?->email,
            ]),
            'date_entree' => $this->date_entree?->toDateString(),
            'actif' => (bool) $this->actif,
            'notes' => $this->notes,
            'organisme' => $this->organisme,
            'insurance_number' => $this->insurance_number,
            'dialysis_group' => $this->dialysis_group,
            'assigned_machine_id' => $this->assigned_machine_id,
            'assigned_machine' => $this->whenLoaded('assignedMachine', fn () => $this->assignedMachine ? [
                'id' => $this->assignedMachine->id,
                'numero' => $this->assignedMachine->numero,
                'statut' => $this->assignedMachine->statut,
            ] : null),
            'coverage_type' => $this->coverage_type,
            'coverage_expiration' => $this->coverage_expiration?->toDateString(),
            'nombre_seances' => $this->seances_count ?? $this->seances()->count(),
            'nombre_absences' => $this->absences_count ?? $this->absences()->count(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
