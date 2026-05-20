<?php

namespace App\Http\Requests;

use Illuminate\Validation\Validator;

class ImportPatientsRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:10240'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $file = $this->file('file');

            if (! $file) {
                return;
            }

            $extension = strtolower($file->getClientOriginalExtension());

            if (! in_array($extension, ['xlsx', 'xls', 'csv'], true)) {
                $validator->errors()->add('file', 'Le fichier doit etre au format .xlsx, .xls ou .csv.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Le fichier est requis.',
            'file.file' => 'Le fichier envoye est invalide.',
            'file.max' => 'Le fichier ne doit pas depasser 10 Mo.',
        ];
    }
}
