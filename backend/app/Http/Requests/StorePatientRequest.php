<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StorePatientRequest extends BaseApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'cin' => $this->cin ? strtoupper(trim((string) $this->cin)) : $this->cin,
            'actif' => $this->boolean('actif', true),
            'emergency_contact' => $this->nullableText('emergency_contact'),
            'organisme' => $this->nullableText('organisme'),
            'insurance_number' => $this->nullableText('insurance_number'),
            'dialysis_group' => $this->nullableText('dialysis_group'),
            'coverage_type' => $this->nullableText('coverage_type'),
            'coverage_expiration' => $this->nullableText('coverage_expiration'),
        ]);
    }

    public function rules(): array
    {
        $patient = $this->route('patient');
        $patientId = is_object($patient) ? $patient->id : $patient;

        return [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'cin' => ['required', Rule::unique('patients', 'cin')->ignore($patientId), 'regex:/^[A-Z]{1,2}[0-9]+$/i'],
            'date_naissance' => ['required', 'date', 'before:today'],
            'sexe' => ['required', Rule::in(['M', 'F'])],
            'telephone' => ['required', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'emergency_contact' => ['nullable', 'string', 'max:120'],
            'adresse' => ['required', 'string', 'max:255'],
            'ville' => ['required', 'string', 'max:120'],
            'groupe_sanguin' => ['required', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'poids' => ['required', 'numeric', 'between:1,999.99'],
            'taille' => ['required', 'integer', 'between:30,250'],
            'cause_insuffisance_renale' => ['required', 'string'],
            'nephrologue_id' => ['nullable', Rule::exists('users', 'id')->where('role', 'doctor')],
            'date_entree' => ['required', 'date'],
            'actif' => ['boolean'],
            'notes' => ['nullable', 'string'],
            'organisme' => ['nullable', Rule::in(['CNSS', 'CNOPS', 'AMO', 'Assurance privée', 'Sans couverture'])],
            'insurance_number' => ['nullable', 'string', 'max:120'],
            'dialysis_group' => ['nullable', Rule::in(['L/M/V', 'M/J/S'])],
            'assigned_machine_id' => ['nullable', 'exists:machines,id'],
            'coverage_type' => ['nullable', 'string', 'max:120'],
            'coverage_expiration' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'prenom.required' => 'Le prenom est requis.',
            'cin.required' => 'Le CIN est requis.',
            'cin.unique' => 'Ce CIN est deja utilise.',
            'cin.regex' => 'Le CIN doit respecter le format marocain attendu.',
            'date_naissance.required' => 'La date de naissance est requise.',
            'date_naissance.before' => 'La date de naissance doit etre anterieure a aujourd hui.',
            'sexe.required' => 'Le sexe est requis.',
            'sexe.in' => 'Le sexe doit etre M ou F.',
            'telephone.required' => 'Le telephone est requis.',
            'telephone.regex' => 'Le telephone doit commencer par 05, 06 ou 07 et contenir 10 chiffres.',
            'emergency_contact.max' => 'Le contact d urgence ne doit pas depasser 120 caracteres.',
            'adresse.required' => "L'adresse est requise.",
            'ville.required' => 'La ville est requise.',
            'groupe_sanguin.required' => 'Le groupe sanguin est requis.',
            'groupe_sanguin.in' => 'Le groupe sanguin est invalide.',
            'poids.required' => 'Le poids est requis.',
            'poids.numeric' => 'Le poids doit etre un nombre.',
            'taille.required' => 'La taille est requise.',
            'taille.integer' => 'La taille doit etre un nombre entier.',
            'cause_insuffisance_renale.required' => 'La cause de l insuffisance renale est requise.',
            'nephrologue_id.exists' => 'Le nephrologue selectionne est invalide.',
            'date_entree.required' => "La date d'entree est requise.",
            'organisme.in' => 'L organisme selectionne est invalide.',
            'insurance_number.max' => 'Le numero d assurance ne doit pas depasser 120 caracteres.',
            'dialysis_group.in' => 'Le groupe de dialyse est invalide.',
            'assigned_machine_id.exists' => 'La machine assignee est invalide.',
            'coverage_type.max' => 'Le type de couverture ne doit pas depasser 120 caracteres.',
            'coverage_expiration.date' => 'La date d expiration de couverture est invalide.',
        ];
    }

    private function nullableText(string $key): ?string
    {
        $value = $this->input($key);

        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
