<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreSeanceRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'machine_id' => ['required', 'exists:machines,id'],
            'infirmier_id' => ['nullable', Rule::exists('users', 'id')->where('role', 'infirmier')],
            'date_seance' => ['required', 'date'],
            'heure_debut' => ['required', 'date_format:H:i'],
            'heure_fin' => ['required', 'date_format:H:i', 'after:heure_debut'],
            'duree_minutes' => ['required', 'integer', 'between:30,480'],
            'statut' => ['required', Rule::in(['planifiee', 'effectuee', 'annulee'])],
            'tension_avant' => ['nullable', 'string', 'max:10'],
            'tension_apres' => ['nullable', 'string', 'max:10'],
            'poids_avant' => ['nullable', 'numeric', 'between:1,999.99'],
            'poids_apres' => ['nullable', 'numeric', 'between:1,999.99'],
            'poids_sec' => ['nullable', 'numeric', 'between:1,999.99'],
            'observations' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required' => 'Le patient est requis.',
            'patient_id.exists' => 'Le patient selectionne est invalide.',
            'machine_id.required' => 'La machine est requise.',
            'machine_id.exists' => 'La machine selectionnee est invalide.',
            'infirmier_id.exists' => "L'infirmier selectionne est invalide.",
            'date_seance.required' => 'La date de seance est requise.',
            'heure_debut.required' => 'L heure de debut est requise.',
            'heure_debut.date_format' => 'L heure de debut doit etre au format HH:MM.',
            'heure_fin.required' => 'L heure de fin est requise.',
            'heure_fin.after' => 'L heure de fin doit etre apres l heure de debut.',
            'duree_minutes.required' => 'La duree est requise.',
            'duree_minutes.between' => 'La duree doit etre comprise entre 30 et 480 minutes.',
            'statut.required' => 'Le statut est requis.',
            'statut.in' => 'Le statut est invalide.',
        ];
    }
}
