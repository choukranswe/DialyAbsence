<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMachineRequest;
use App\Http\Resources\MachineResource;
use App\Models\Machine;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class MachineController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuditService $auditService)
    {
    }

    public function index(): JsonResponse
    {
        $machines = Machine::withCount('seances')->orderBy('numero')->get();

        return $this->success(MachineResource::collection($machines), 'Machines recuperees avec succes');
    }

    public function store(StoreMachineRequest $request): JsonResponse
    {
        $machine = Machine::create($request->validated());
        $this->auditService->log('create', 'machines', $machine->id, null, $machine->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new MachineResource($machine), 'Machine creee avec succes', 201);
    }

    public function update(StoreMachineRequest $request, Machine $machine): JsonResponse
    {
        $old = $machine->getOriginal();
        $machine->update($request->validated());
        $this->auditService->log('update', 'machines', $machine->id, $old, $machine->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new MachineResource($machine), 'Machine modifiee avec succes');
    }
}
