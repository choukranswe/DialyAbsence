<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuditService $auditService)
    {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password) || ! $user->actif) {
            return $this->error('Identifiants invalides ou compte desactive', [], 401);
        }

        $token = $user->createToken('api-token', [$user->role])->plainTextToken;
        $this->auditService->log('login', 'users', $user->id, null, ['email' => $user->email]);

        return $this->success([
            'token' => $token,
            'user' => (new UserResource($user))->resolve($request),
        ], 'Connexion reussie');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->success(null, 'Deconnexion reussie');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()), 'Utilisateur courant');
    }
}
