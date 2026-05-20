<?php

use App\Http\Controllers\Api\AbsenceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MachineController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SeanceController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/weekly-attendance', [DashboardController::class, 'weeklyAttendance']);
    Route::get('/dashboard/alerts', [DashboardController::class, 'alerts']);

    Route::get('/patients/{patient}/seances', [PatientController::class, 'seances']);
    Route::get('/patients/{patient}/absences', [PatientController::class, 'absences']);
    Route::get('/patients/{patient}/stats', [PatientController::class, 'stats']);
    Route::post('/patients/import', [PatientController::class, 'import'])->middleware('audit');
    Route::apiResource('patients', PatientController::class)->middleware('audit');

    Route::get('/seances/today', [SeanceController::class, 'today']);
    Route::get('/seances/week', [SeanceController::class, 'week']);
    Route::apiResource('seances', SeanceController::class)->middleware('audit');

    Route::get('/absences/export', [AbsenceController::class, 'export']);
    Route::apiResource('absences', AbsenceController::class)->middleware('audit');

    Route::apiResource('machines', MachineController::class)->only(['index', 'store', 'update'])->middleware('audit');

    Route::get('/reports/monthly-attendance', [ReportController::class, 'monthlyAttendance']);
    Route::get('/reports/monthly-absences', [ReportController::class, 'monthlyAbsences']);
    Route::get('/reports/patient-fiche/{patient}', [ReportController::class, 'patientFiche']);
    Route::get('/reports/cnss-export', [ReportController::class, 'cnssExport']);

    Route::middleware('role:admin')->group(function (): void {
        Route::apiResource('users', UserController::class)->only(['index', 'store', 'update'])->middleware('audit');
    });
});
