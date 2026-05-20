<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuditService $auditService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 15), 100);
        $users = User::query()
            ->when($request->filled('role'), fn ($query) => $query->where('role', $request->role))
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search): void {
                    $query->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('nom')
            ->paginate($perPage)
            ->withQueryString();

        return $this->paginated(UserResource::collection($users), $users, 'Utilisateurs recuperes avec succes');
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        $this->auditService->log('create', 'users', $user->id, null, $user->makeHidden('password')->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new UserResource($user), 'Utilisateur cree avec succes', 201);
    }

    public function update(StoreUserRequest $request, User $user): JsonResponse
    {
        $old = $user->makeHidden('password')->toArray();
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        $this->auditService->log('update', 'users', $user->id, $old, $user->makeHidden('password')->toArray());
        $request->attributes->set('audit_logged', true);

        return $this->success(new UserResource($user), 'Utilisateur modifie avec succes');
    }
}
