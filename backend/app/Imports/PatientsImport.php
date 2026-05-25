<?php

namespace App\Imports;

use App\Models\Patient;
use App\Services\AuditService;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use Throwable;

class PatientsImport implements ToCollection, WithHeadingRow
{
    private const ORGANISMES = ['CNSS', 'CNOPS', 'AMO', 'AMO&CNSS', 'FAR', 'Assurance privée', 'Sans couverture'];

    private int $created = 0;

    private array $errors = [];

    public function __construct(private readonly AuditService $auditService)
    {
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            $line = $index + 2;
            $data = $this->normalizeRow($row);

            if ($this->isEmptyRow($data)) {
                continue;
            }

            $validator = Validator::make($data, [
                'nom' => ['required', 'string', 'max:255'],
                'prenom' => ['required', 'string', 'max:255'],
                'cin' => ['required', Rule::unique('patients', 'cin'), 'regex:/^[A-Z]{1,2}[0-9]+$/i'],
                'telephone' => ['required', 'regex:/^(05|06|07)[0-9]{8}$/'],
                'date_naissance' => ['required', 'date', 'before:today'],
                'statut' => ['required', Rule::in(['actif', 'inactif'])],
                'sexe' => ['nullable', Rule::in(['M', 'F'])],
                'groupe_sanguin' => ['nullable', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
                'poids' => ['nullable', 'numeric', 'between:1,999.99'],
                'taille' => ['nullable', 'integer', 'between:30,250'],
                'date_entree' => ['nullable', 'date'],
                'emergency_contact' => ['nullable', 'string', 'max:120'],
                'organisme' => ['nullable', Rule::in(self::ORGANISMES)],
                'insurance_number' => ['nullable', 'string', 'max:120'],
                'dialysis_group' => ['nullable', Rule::in(['L/M/V', 'M/J/S'])],
                'coverage_type' => ['nullable', 'string', 'max:120'],
                'coverage_expiration' => ['nullable', 'date'],
            ], [
                'nom.required' => "Le nom est requis.",
                'prenom.required' => "Le prenom est requis.",
                'cin.required' => "Le CIN est requis.",
                'cin.unique' => "Ce CIN existe deja.",
                'cin.regex' => "Le format du CIN est invalide.",
                'telephone.required' => "Le telephone est requis.",
                'telephone.regex' => "Le format du telephone est invalide.",
                'date_naissance.required' => "La date de naissance est requise.",
                'date_naissance.date' => "La date de naissance est invalide.",
                'date_naissance.before' => "La date de naissance doit etre anterieure a aujourd'hui.",
                'statut.required' => "Le statut est requis.",
                'statut.in' => "Le statut doit etre actif ou inactif.",
                'organisme.in' => "L organisme est invalide.",
                'dialysis_group.in' => "Le groupe de dialyse est invalide.",
            ]);

            if ($validator->fails()) {
                $this->errors[] = [
                    'row' => $line,
                    'messages' => $validator->errors()->all(),
                ];
                continue;
            }

            try {
                $patient = Patient::create($this->patientPayload($data));
                $this->auditService->log('create', 'patients', $patient->id, null, $patient->toArray());
                $this->created++;
            } catch (Throwable $exception) {
                $this->errors[] = [
                    'row' => $line,
                    'messages' => ['Impossible d importer cette ligne : '.$exception->getMessage()],
                ];
            }
        }
    }

    public function createdCount(): int
    {
        return $this->created;
    }

    public function rowErrors(): array
    {
        return $this->errors;
    }

    private function normalizeRow(Collection $row): array
    {
        return [
            'nom' => $this->text($this->value($row, ['nom', 'last_name'])),
            'prenom' => $this->text($this->value($row, ['prenom', 'first_name'])),
            'cin' => $this->cin($this->value($row, ['cin', 'c_i_n'])),
            'telephone' => $this->phone($this->value($row, ['telephone', 'tel', 'phone'])),
            'date_naissance' => $this->date($this->value($row, ['date_naissance', 'date_de_naissance', 'naissance', 'datenaissance'])),
            'statut' => $this->status($this->value($row, ['statut', 'status'])),
            'sexe' => $this->sex($this->value($row, ['sexe', 'genre'])),
            'emergency_contact' => $this->text($this->value($row, ['emergency_contact', 'contact_urgence', 'contacturgence'])),
            'adresse' => $this->text($this->value($row, ['adresse', 'address'])),
            'ville' => $this->text($this->value($row, ['ville', 'city'])),
            'groupe_sanguin' => $this->bloodGroup($this->value($row, ['groupe_sanguin', 'groupe', 'sang'])),
            'poids' => $this->number($this->value($row, ['poids', 'poids_kg'])),
            'taille' => $this->number($this->value($row, ['taille', 'taille_cm'])),
            'cause_insuffisance_renale' => $this->text($this->value($row, ['cause_insuffisance_renale', 'cause'])),
            'date_entree' => $this->date($this->value($row, ['date_entree', 'date_dentree', 'entree'])),
            'notes' => $this->text($this->value($row, ['notes', 'note'])),
            'organisme' => $this->organisme($this->value($row, ['organisme', 'organism', 'assurance', 'mutuelle'])),
            'insurance_number' => $this->text($this->value($row, ['insurance_number', 'numero_assurance', 'numeroassurance', 'matricule', 'numero_mutuelle'])),
            'dialysis_group' => $this->dialysisGroup($this->value($row, ['dialysis_group', 'groupe_dialyse', 'groupedialyse'])),
            'coverage_type' => $this->text($this->value($row, ['coverage_type', 'type_couverture', 'couverture'])),
            'coverage_expiration' => $this->date($this->value($row, ['coverage_expiration', 'expiration_couverture', 'date_expiration'])),
        ];
    }

    private function patientPayload(array $data): array
    {
        return [
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'cin' => $data['cin'],
            'date_naissance' => $data['date_naissance'],
            'sexe' => $data['sexe'] ?: 'M',
            'telephone' => $data['telephone'],
            'emergency_contact' => $data['emergency_contact'],
            'adresse' => $data['adresse'] ?: 'Non renseignee',
            'ville' => $data['ville'] ?: 'Casablanca',
            'groupe_sanguin' => $data['groupe_sanguin'] ?: 'O+',
            'poids' => $data['poids'] ?: 70,
            'taille' => $data['taille'] ?: 170,
            'cause_insuffisance_renale' => $data['cause_insuffisance_renale'] ?: 'Non renseignee',
            'nephrologue_id' => null,
            'date_entree' => $data['date_entree'] ?: Carbon::today()->toDateString(),
            'actif' => $data['statut'] === 'actif',
            'notes' => $data['notes'] ?: 'Import Excel - informations a completer.',
            'organisme' => $data['organisme'],
            'insurance_number' => $data['insurance_number'],
            'dialysis_group' => $data['dialysis_group'],
            'assigned_machine_id' => null,
            'coverage_type' => $data['coverage_type'],
            'coverage_expiration' => $data['coverage_expiration'],
        ];
    }

    private function value(Collection $row, array $keys): mixed
    {
        foreach ($keys as $key) {
            if ($row->has($key)) {
                return $row->get($key);
            }
        }

        return null;
    }

    private function isEmptyRow(array $data): bool
    {
        return collect($data)->every(fn ($value): bool => $value === null || $value === '');
    }

    private function text(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function cin(mixed $value): ?string
    {
        $value = $this->text($value);

        return $value ? strtoupper(preg_replace('/\s+/', '', $value)) : null;
    }

    private function phone(mixed $value): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $value);

        if ($digits === '') {
            return null;
        }

        if (strlen($digits) === 9 && in_array($digits[0], ['5', '6', '7'], true)) {
            return '0'.$digits;
        }

        if (strlen($digits) === 12 && str_starts_with($digits, '212')) {
            return '0'.substr($digits, 3);
        }

        return $digits;
    }

    private function date(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->toDateString();
        }

        if (is_numeric($value)) {
            return Carbon::instance(ExcelDate::excelToDateTimeObject((float) $value))->toDateString();
        }

        $value = trim((string) $value);
        $formats = ['Y-m-d', 'd/m/Y', 'd-m-Y', 'm/d/Y'];

        foreach ($formats as $format) {
            try {
                $date = Carbon::createFromFormat($format, $value);
            } catch (Throwable) {
                continue;
            }

            if ($date !== false && $date->format($format) === $value) {
                return $date->toDateString();
            }
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (Throwable) {
            return $value;
        }
    }

    private function status(mixed $value): ?string
    {
        $value = strtolower(Str::ascii($this->text($value) ?? ''));

        return match ($value) {
            'actif', 'active', '1', 'true', 'oui', 'yes' => 'actif',
            'inactif', 'inactive', 'archive', 'archivee', '0', 'false', 'non', 'no' => 'inactif',
            default => $value ?: null,
        };
    }

    private function sex(mixed $value): ?string
    {
        $value = strtolower(Str::ascii($this->text($value) ?? ''));

        return match ($value) {
            'm', 'masculin', 'homme' => 'M',
            'f', 'feminin', 'femme' => 'F',
            default => null,
        };
    }

    private function bloodGroup(mixed $value): ?string
    {
        $value = strtoupper(str_replace(' ', '', $this->text($value) ?? ''));

        return $value ?: null;
    }

    private function organisme(mixed $value): ?string
    {
        $text = $this->text($value);

        if (! $text) {
            return null;
        }

        return match (strtolower(Str::ascii($text))) {
            'cnss' => 'CNSS',
            'cnops' => 'CNOPS',
            'ramed' => 'RAMED',
            'amo' => 'AMO',
            'amo&cnss', 'amo cnss', 'amo/cnss', 'amo et cnss' => 'AMO&CNSS',
            'far' => 'FAR',
            'assurance privee', 'assurance prive', 'private insurance' => 'Assurance privée',
            'sans couverture', 'aucune', 'none' => 'Sans couverture',
            default => $text,
        };
    }

    private function dialysisGroup(mixed $value): ?string
    {
        $value = strtoupper(str_replace(' ', '', $this->text($value) ?? ''));

        return match ($value) {
            'L/M/V', 'LMV' => 'L/M/V',
            'M/J/S', 'MJS' => 'M/J/S',
            default => $value ?: null,
        };
    }

    private function number(mixed $value): mixed
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? $value : str_replace(',', '.', (string) $value);
    }
}
