<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNurseLeaveRequest;
use App\Http\Resources\NurseLeaveResource;
use App\Models\NurseLeave;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NurseLeaveController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuditService $auditService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 50), 150);

        $leaves = NurseLeave::with(['nurse', 'approver'])
            ->when($request->filled('nurse_id'), fn ($query) => $query->where('nurse_id', $request->nurse_id))
            ->when($request->filled('status') && $request->status !== 'all', fn ($query) => $query->where('status', $request->status))
            ->when($request->filled('from'), fn ($query) => $query->whereDate('end_date', '>=', $request->from))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('start_date', '<=', $request->to))
            ->orderByDesc('start_date')
            ->paginate($perPage)
            ->withQueryString();

        return $this->paginated(NurseLeaveResource::collection($leaves), $leaves, 'Conges du personnel recuperes avec succes');
    }

    public function store(StoreNurseLeaveRequest $request): JsonResponse
    {
        $leave = NurseLeave::create($this->payload($request->validated(), $request));
        $leave->load(['nurse', 'approver']);
        $this->auditService->log('create', 'nurse_leaves', $leave->id, null, $leave->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new NurseLeaveResource($leave), 'Demande de conge creee avec succes', 201);
    }

    public function show(NurseLeave $nurseLeave): JsonResponse
    {
        $nurseLeave->load(['nurse', 'approver']);

        return $this->success(new NurseLeaveResource($nurseLeave), 'Conge du personnel recupere avec succes');
    }

    public function update(StoreNurseLeaveRequest $request, NurseLeave $nurseLeave): JsonResponse
    {
        $old = $nurseLeave->getOriginal();
        $nurseLeave->update($this->payload($request->validated(), $request));
        $nurseLeave->load(['nurse', 'approver']);
        $this->auditService->log('update', 'nurse_leaves', $nurseLeave->id, $old, $nurseLeave->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new NurseLeaveResource($nurseLeave), 'Conge du personnel modifie avec succes');
    }

    public function approve(Request $request, NurseLeave $nurseLeave): JsonResponse
    {
        return $this->changeStatus($request, $nurseLeave, 'approved', 'Conge approuve avec succes');
    }

    public function refuse(Request $request, NurseLeave $nurseLeave): JsonResponse
    {
        return $this->changeStatus($request, $nurseLeave, 'refused', 'Conge refuse avec succes');
    }

    public function destroy(Request $request, NurseLeave $nurseLeave): JsonResponse
    {
        return $this->changeStatus($request, $nurseLeave, 'cancelled', 'Conge annule avec succes');
    }

    private function payload(array $data, Request $request): array
    {
        if (in_array($data['status'], ['approved', 'refused'], true)) {
            $data['approved_by'] = $request->user()?->id;
        } else {
            $data['approved_by'] = null;
        }

        return $data;
    }

    private function changeStatus(Request $request, NurseLeave $leave, string $status, string $message): JsonResponse
    {
        $old = $leave->getOriginal();
        $leave->update([
            'status' => $status,
            'approved_by' => $request->user()?->id,
        ]);
        $leave->load(['nurse', 'approver']);
        $this->auditService->log('update', 'nurse_leaves', $leave->id, $old, $leave->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new NurseLeaveResource($leave), $message);
    }
}
