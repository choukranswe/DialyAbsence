<?php

namespace App\Http\Requests;

class LoginRequest extends BaseApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => "L'adresse email est requise.",
            'email.email' => "L'adresse email est invalide.",
            'password.required' => 'Le mot de passe est requis.',
        ];
    }
}
