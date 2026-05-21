<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreNurseLeaveRequest extends BaseApiRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'reason' => $this->nullableText('reason'),
            'notes' => $this->nullableText('notes'),
        ]);
    }

    public function rules(): array
    {
        return [
            'nurse_id' => ['required', Rule::exists('nurses', 'id')->where('status', 'active')],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'leave_type' => ['required', Rule::in(['annual_leave', 'sick_leave', 'exceptional_leave', 'vacation', 'rest_day'])],
            'reason' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['pending', 'approved', 'refused', 'cancelled'])],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nurse_id.required' => 'Le personnel infirmier est requis.',
            'nurse_id.exists' => 'Le personnel infirmier selectionne est invalide ou archive.',
            'start_date.required' => 'La date de debut est requise.',
            'end_date.required' => 'La date de fin est requise.',
            'end_date.after_or_equal' => 'La date de fin doit etre apres la date de debut.',
            'leave_type.required' => 'Le type de conge est requis.',
            'leave_type.in' => 'Le type de conge est invalide.',
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
