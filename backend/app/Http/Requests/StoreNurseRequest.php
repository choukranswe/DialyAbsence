<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreNurseRequest extends BaseApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'full_name' => $this->nullableText('full_name'),
            'phone' => $this->nullableText('phone'),
            'shift' => $this->nullableText('shift'),
            'notes' => $this->nullableText('notes'),
        ]);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'shift' => ['nullable', 'string', 'max:80'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Le nom complet est requis.',
            'phone.regex' => 'Le telephone doit commencer par 05, 06 ou 07 et contenir 10 chiffres.',
            'status.required' => 'Le statut est requis.',
            'status.in' => 'Le statut est invalide.',
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
