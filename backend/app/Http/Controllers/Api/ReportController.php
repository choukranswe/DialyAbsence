<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
    }

    public function monthlyAttendance(Request $request)
    {
        [$month, $year] = $this->validatedPeriod($request);

        return $this->reportService->generateMonthlyAttendancePDF($month, $year);
    }

    public function monthlyAbsences(Request $request)
    {
        [$month, $year] = $this->validatedPeriod($request);

        return $this->reportService->generateMonthlyAbsencesPDF($month, $year);
    }

    public function patientFiche(Patient $patient)
    {
        return $this->reportService->generatePatientFichePDF($patient->id);
    }

    public function cnssExport(Request $request): BinaryFileResponse
    {
        [$month, $year] = $this->validatedPeriod($request);

        return $this->reportService->exportCNSSExcel($month, $year);
    }

    private function validatedPeriod(Request $request): array
    {
        $validated = $request->validate([
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'between:2020,2100'],
        ]);

        return [(int) $validated['month'], (int) $validated['year']];
    }
}
