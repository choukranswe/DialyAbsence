<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportPatientsRequest;
use App\Http\Requests\StorePatientRequest;
use App\Http\Resources\AbsenceResource;
use App\Http\Resources\PatientResource;
use App\Http\Resources\SeanceResource;
use App\Imports\PatientsImport;
use App\Models\Patient;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class PatientController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuditService $auditService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 15), 100);

        $patients = Patient::query()
            ->with('nephrologue')
            ->withCount(['seances', 'absences'])
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search): void {
                    $query->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('cin', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('statut') && $request->statut !== 'tous', function ($query) use ($request): void {
                $query->where('actif', $request->statut === 'actif');
            })
            ->orderBy('nom')
            ->orderBy('prenom')
            ->paginate($perPage)
            ->withQueryString();

        return $this->paginated(PatientResource::collection($patients), $patients, 'Patients recuperes avec succes');
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $patient = Patient::create($request->validated());
        $patient->load('nephrologue')->loadCount(['seances', 'absences']);
        $this->auditService->log('create', 'patients', $patient->id, null, $patient->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new PatientResource($patient), 'Patient cree avec succes', 201);
    }

    public function import(ImportPatientsRequest $request): JsonResponse
    {
        $import = new PatientsImport($this->auditService);

        Excel::import($import, $request->file('file'));
        $request->attributes->set('audit_logged', true);

        $created = $import->createdCount();
        $errors = $import->rowErrors();

        if ($created === 0) {
            $firstError = $errors[0]['messages'][0] ?? 'Aucune ligne valide trouvee.';

            return $this->error('Aucun patient importe. '.$firstError, ['file' => [$firstError]], 422);
        }

        $message = $created === 1 ? '1 patient importe avec succes' : "{$created} patients importes avec succes";

        if (count($errors) > 0) {
            $message .= ' avec '.count($errors).' ligne(s) ignoree(s)';
        }

        return $this->success([
            'created' => $created,
            'errors' => $errors,
        ], $message, 201);
    }

    public function show(Patient $patient): JsonResponse
    {
        $patient->load('nephrologue')->loadCount(['seances', 'absences']);

        return $this->success(new PatientResource($patient), 'Patient recupere avec succes');
    }

    public function update(StorePatientRequest $request, Patient $patient): JsonResponse
    {
        $old = $patient->getOriginal();
        $patient->update($request->validated());
        $patient->load('nephrologue')->loadCount(['seances', 'absences']);
        $this->auditService->log('update', 'patients', $patient->id, $old, $patient->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new PatientResource($patient), 'Patient modifie avec succes');
    }

    public function destroy(Request $request, Patient $patient): JsonResponse
    {
        $old = $patient->getOriginal();
        $patient->update(['actif' => false]);
        $patient->load('nephrologue')->loadCount(['seances', 'absences']);
        $this->auditService->log('delete', 'patients', $patient->id, $old, $patient->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new PatientResource($patient), 'Patient archive avec succes');
    }

    public function seances(Patient $patient, Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 15), 100);
        $seances = $patient->seances()
            ->with(['patient', 'machine', 'infirmier'])
            ->orderByDesc('date_seance')
            ->paginate($perPage);

        return $this->paginated(SeanceResource::collection($seances), $seances, 'Seances du patient recuperees');
    }

    public function absences(Patient $patient, Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 15), 100);
        $absences = $patient->absences()
            ->with(['patient', 'seance', 'declarant'])
            ->orderByDesc('date_absence')
            ->paginate($perPage);

        return $this->paginated(AbsenceResource::collection($absences), $absences, 'Absences du patient recuperees');
    }

    public function stats(Patient $patient): JsonResponse
    {
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();

        return $this->success([
            'total_seances' => $patient->seances()->count(),
            'seances_effectuees' => $patient->seances()->where('statut', 'effectuee')->count(),
            'absences_total' => $patient->absences()->count(),
            'absences_ce_mois' => $patient->absences()->whereBetween('date_absence', [$monthStart, $monthEnd])->count(),
            'derniere_seance' => $patient->seances()->latest('date_seance')->first()?->date_seance?->toDateString(),
            'taux_presence' => $this->presenceRate($patient),
        ], 'Statistiques du patient recuperees');
    }

    private function presenceRate(Patient $patient): float
    {
        $total = $patient->seances()->count();

        if ($total === 0) {
            return 0.0;
        }

        $effectuees = $patient->seances()->where('statut', 'effectuee')->count();

        return round(($effectuees / $total) * 100, 2);
    }
}
