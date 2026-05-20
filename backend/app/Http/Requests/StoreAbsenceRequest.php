<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreAbsenceRequest extends BaseApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'justifiee' => $this->boolean('justifiee'),
        ]);
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'seance_id' => ['nullable', 'exists:seances,id'],
            'date_absence' => ['required', 'date'],
            'motif' => ['required', Rule::in(['medical', 'personnel', 'hospitalise', 'autre'])],
            'justifiee' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required' => 'Le patient est requis.',
            'patient_id.exists' => 'Le patient selectionne est invalide.',
            'seance_id.exists' => 'La seance selectionnee est invalide.',
            'date_absence.required' => "La date d'absence est requise.",
            'date_absence.date' => "La date d'absence est invalide.",
            'motif.required' => 'Le motif est requis.',
            'motif.in' => 'Le motif est invalide.',
            'justifiee.boolean' => 'Le champ justifiee doit etre vrai ou faux.',
        ];
    }
}
