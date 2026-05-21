<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreUserRequest extends BaseApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'actif' => $this->boolean('actif', true),
        ]);
    }

    public function rules(): array
    {
        $user = $this->route('user');
        $userId = is_object($user) ? $user->id : $user;
        $isUpdate = in_array($this->method(), ['PUT', 'PATCH'], true);

        return [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => [$isUpdate ? 'nullable' : 'required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['admin', 'doctor', 'receptionist'])],
            'telephone' => ['nullable', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'actif' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'prenom.required' => 'Le prenom est requis.',
            'email.required' => "L'adresse email est requise.",
            'email.email' => "L'adresse email est invalide.",
            'email.unique' => "L'adresse email est deja utilisee.",
            'password.required' => 'Le mot de passe est requis.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caracteres.',
            'role.required' => 'Le role est requis.',
            'role.in' => 'Le role selectionne est invalide.',
            'telephone.regex' => 'Le telephone doit commencer par 05, 06 ou 07 et contenir 10 chiffres.',
        ];
    }
}
