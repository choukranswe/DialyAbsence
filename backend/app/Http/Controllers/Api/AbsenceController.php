<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAbsenceRequest;
use App\Http\Resources\AbsenceResource;
use App\Models\Absence;
use App\Services\AuditService;
use App\Services\ReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AbsenceController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuditService $auditService, private readonly ReportService $reportService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 15), 100);
        $absences = Absence::with(['patient', 'seance', 'declarant'])
            ->when($request->filled('patient_id'), fn ($query) => $query->where('patient_id', $request->patient_id))
            ->when($request->filled('from'), fn ($query) => $query->whereDate('date_absence', '>=', $request->from))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('date_absence', '<=', $request->to))
            ->when($request->filled('motif'), fn ($query) => $query->where('motif', $request->motif))
            ->when($request->filled('justifiee'), fn ($query) => $query->where('justifiee', filter_var($request->justifiee, FILTER_VALIDATE_BOOLEAN)))
            ->orderByDesc('date_absence')
            ->paginate($perPage)
            ->withQueryString();

        return $this->paginated(AbsenceResource::collection($absences), $absences, 'Absences recuperees avec succes');
    }

    public function store(StoreAbsenceRequest $request): JsonResponse
    {
        $absence = Absence::create([
            ...$request->validated(),
            'declared_by' => $request->user()->id,
        ]);

        if ($absence->seance) {
            $absence->seance->update(['statut' => 'annulee']);
        }

        $absence->load(['patient', 'seance', 'declarant']);
        $this->auditService->log('create', 'absences', $absence->id, null, $absence->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new AbsenceResource($absence), 'Absence declaree avec succes', 201);
    }

    public function show(Absence $absence): JsonResponse
    {
        $absence->load(['patient', 'seance', 'declarant']);

        return $this->success(new AbsenceResource($absence), 'Absence recuperee avec succes');
    }

    public function update(StoreAbsenceRequest $request, Absence $absence): JsonResponse
    {
        $old = $absence->getOriginal();
        $absence->update($request->validated());
        $absence->load(['patient', 'seance', 'declarant']);
        $this->auditService->log('update', 'absences', $absence->id, $old, $absence->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new AbsenceResource($absence), 'Absence modifiee avec succes');
    }

    public function destroy(Request $request, Absence $absence): JsonResponse
    {
        $old = $absence->toArray();
        $absence->delete();
        $this->auditService->log('delete', 'absences', $absence->id, $old, null);
        $request->attributes->set('audit_logged', true);

        return $this->success(null, 'Absence supprimee avec succes');
    }

    public function export(Request $request): BinaryFileResponse
    {
        return $this->reportService->exportAbsencesExcel($request->only(['patient_id', 'from', 'to', 'motif', 'justifiee', 'organisme']));
    }
}
