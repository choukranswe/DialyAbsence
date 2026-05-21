<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNurseRequest;
use App\Http\Resources\NurseResource;
use App\Models\Nurse;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NurseController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuditService $auditService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 15), 100);

        $nurses = Nurse::query()
            ->withCount('leaves')
            ->when($request->filled('status') && $request->status !== 'all', fn ($query) => $query->where('status', $request->status))
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search): void {
                    $query->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('shift', 'like', "%{$search}%");
                });
            })
            ->orderBy('full_name')
            ->paginate($perPage)
            ->withQueryString();

        return $this->paginated(NurseResource::collection($nurses), $nurses, 'Personnel infirmier recupere avec succes');
    }

    public function store(StoreNurseRequest $request): JsonResponse
    {
        $nurse = Nurse::create($request->validated());
        $this->auditService->log('create', 'nurses', $nurse->id, null, $nurse->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new NurseResource($nurse), 'Infirmier cree avec succes', 201);
    }

    public function show(Nurse $nurse): JsonResponse
    {
        $nurse->loadCount('leaves');

        return $this->success(new NurseResource($nurse), 'Infirmier recupere avec succes');
    }

    public function update(StoreNurseRequest $request, Nurse $nurse): JsonResponse
    {
        $old = $nurse->getOriginal();
        $nurse->update($request->validated());
        $this->auditService->log('update', 'nurses', $nurse->id, $old, $nurse->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new NurseResource($nurse), 'Infirmier modifie avec succes');
    }

    public function destroy(Request $request, Nurse $nurse): JsonResponse
    {
        $old = $nurse->getOriginal();
        $nurse->update(['status' => 'inactive']);
        $this->auditService->log('delete', 'nurses', $nurse->id, $old, $nurse->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new NurseResource($nurse), 'Infirmier archive avec succes');
    }
}
