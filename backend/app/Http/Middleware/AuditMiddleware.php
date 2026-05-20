<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditMiddleware
{
    public function __construct(private readonly AuditService $auditService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->attributes->get('audit_logged') === true) {
            return $response;
        }

        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true) || $response->getStatusCode() >= 400) {
            return $response;
        }

        $route = $request->route();
        $routeName = $route?->getName() ?? '';
        $tableName = str($routeName ?: $request->path())->after('api/')->before('.')->before('/')->replace('-', '_')->toString();
        $action = match ($request->method()) {
            'POST' => 'create',
            'DELETE' => 'delete',
            default => 'update',
        };

        $recordId = null;
        foreach ($route?->parameters() ?? [] as $parameter) {
            if ($parameter instanceof Model) {
                $recordId = $parameter->getKey();
                $tableName = $parameter->getTable();
                break;
            }

            if (is_numeric($parameter)) {
                $recordId = (int) $parameter;
            }
        }

        $this->auditService->log(
            $action,
            $tableName ?: 'api',
            $recordId,
            null,
            $request->except(['password', 'password_confirmation'])
        );

        return $response;
    }
}
