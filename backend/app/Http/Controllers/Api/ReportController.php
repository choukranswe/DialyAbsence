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
        $filters = $this->validatedMonthlyFilters($request);

        return $this->reportService->generateMonthlyAttendancePDF($filters['month'], $filters['year'], $filters);
    }

    public function monthlyAbsences(Request $request)
    {
        $filters = $this->validatedMonthlyFilters($request);

        return $this->reportService->generateMonthlyAbsencesPDF($filters['month'], $filters['year'], $filters);
    }

    public function patientAbsences(Request $request): BinaryFileResponse
    {
        return $this->reportService->exportAbsencesExcel($this->validatedReportFilters($request));
    }

    public function attendance(Request $request): BinaryFileResponse
    {
        return $this->reportService->exportAttendanceExcel($this->validatedReportFilters($request));
    }

    public function leaves(Request $request): BinaryFileResponse
    {
        return $this->reportService->exportLeavesExcel($this->validatedReportFilters($request));
    }

    public function patientFiche(Patient $patient)
    {
        return $this->reportService->generatePatientFichePDF($patient->id);
    }

    public function cnssExport(Request $request): BinaryFileResponse
    {
        $filters = $this->validatedMonthlyFilters($request);

        return $this->reportService->exportCNSSExcel($filters['month'], $filters['year'], $filters);
    }

    private function validatedMonthlyFilters(Request $request): array
    {
        $validated = $request->validate([
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'between:2020,2100'],
            'organisme' => ['nullable', 'string', 'max:120'],
        ]);

        $validated['month'] = (int) $validated['month'];
        $validated['year'] = (int) $validated['year'];
        $validated['organisme'] = trim((string) ($validated['organisme'] ?? '')) ?: null;

        return $validated;
    }

    private function validatedReportFilters(Request $request): array
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'patient_id' => ['nullable', 'integer', 'exists:patients,id'],
            'nurse_id' => ['nullable', 'integer', 'exists:nurses,id'],
            'organisme' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:40'],
        ]);

        foreach (['from', 'to', 'organisme', 'status'] as $key) {
            $validated[$key] = trim((string) ($validated[$key] ?? '')) ?: null;
        }

        return $validated;
    }
}
