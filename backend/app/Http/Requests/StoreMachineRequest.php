<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreMachineRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $machine = $this->route('machine');
        $machineId = is_object($machine) ? $machine->id : $machine;

        return [
            'numero' => ['required', 'string', 'max:10', Rule::unique('machines', 'numero')->ignore($machineId)],
            'marque' => ['required', 'string', 'max:255'],
            'modele' => ['required', 'string', 'max:255'],
            'statut' => ['required', Rule::in(['disponible', 'en_utilisation', 'maintenance', 'hors_service'])],
            'date_installation' => ['nullable', 'date'],
            'date_derniere_maintenance' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'numero.required' => 'Le numero de machine est requis.',
            'numero.unique' => 'Ce numero de machine existe deja.',
            'marque.required' => 'La marque est requise.',
            'modele.required' => 'Le modele est requis.',
            'statut.required' => 'Le statut est requis.',
            'statut.in' => 'Le statut est invalide.',
        ];
    }
}
