<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSeanceRequest;
use App\Http\Resources\SeanceResource;
use App\Models\Seance;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SeanceController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuditService $auditService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 50), 150);
        $seances = Seance::with(['patient', 'machine', 'infirmier'])
            ->when($request->filled('date'), fn ($query) => $query->whereDate('date_seance', $request->date))
            ->when($request->filled('patient_id'), fn ($query) => $query->where('patient_id', $request->patient_id))
            ->when($request->filled('machine_id'), fn ($query) => $query->where('machine_id', $request->machine_id))
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->statut))
            ->orderBy('date_seance')
            ->orderBy('heure_debut')
            ->paginate($perPage)
            ->withQueryString();

        return $this->paginated(SeanceResource::collection($seances), $seances, 'Seances recuperees avec succes');
    }

    public function store(StoreSeanceRequest $request): JsonResponse
    {
        $seance = Seance::create($request->validated());
        $seance->load(['patient', 'machine', 'infirmier']);
        $this->auditService->log('create', 'seances', $seance->id, null, $seance->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new SeanceResource($seance), 'Seance creee avec succes', 201);
    }

    public function show(Seance $seance): JsonResponse
    {
        $seance->load(['patient', 'machine', 'infirmier']);

        return $this->success(new SeanceResource($seance), 'Seance recuperee avec succes');
    }

    public function update(StoreSeanceRequest $request, Seance $seance): JsonResponse
    {
        $old = $seance->getOriginal();
        $seance->update($request->validated());
        $seance->load(['patient', 'machine', 'infirmier']);
        $this->auditService->log('update', 'seances', $seance->id, $old, $seance->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new SeanceResource($seance), 'Seance modifiee avec succes');
    }

    public function destroy(Request $request, Seance $seance): JsonResponse
    {
        $old = $seance->toArray();
        $seance->delete();
        $this->auditService->log('delete', 'seances', $seance->id, $old, null);
        $request->attributes->set('audit_logged', true);

        return $this->success(null, 'Seance supprimee avec succes');
    }

    public function today(): JsonResponse
    {
        $seances = Seance::with(['patient', 'machine', 'infirmier'])
            ->whereDate('date_seance', today())
            ->orderBy('heure_debut')
            ->get();

        return $this->success(SeanceResource::collection($seances), 'Seances du jour recuperees');
    }

    public function week(Request $request): JsonResponse
    {
        $start = $request->filled('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfWeek();
        $end = $start->copy()->addDays(5)->endOfDay();

        $seances = Seance::with(['patient', 'machine', 'infirmier'])
            ->whereBetween('date_seance', [$start->toDateString(), $end->toDateString()])
            ->orderBy('date_seance')
            ->orderBy('heure_debut')
            ->get();

        return $this->success(SeanceResource::collection($seances), 'Planning hebdomadaire recupere');
    }
}
