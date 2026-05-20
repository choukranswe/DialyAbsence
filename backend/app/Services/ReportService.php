<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Patient;
use App\Models\Seance;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportService
{
    public function generateMonthlyAttendancePDF(int $month, int $year)
    {
        [$start, $end] = $this->period($month, $year);

        $seances = Seance::with(['patient', 'machine', 'infirmier'])
            ->whereBetween('date_seance', [$start->toDateString(), $end->toDateString()])
            ->orderBy('date_seance')
            ->orderBy('heure_debut')
            ->get();

        $summary = [
            'total' => $seances->count(),
            'effectuees' => $seances->where('statut', 'effectuee')->count(),
            'planifiees' => $seances->where('statut', 'planifiee')->count(),
            'annulees' => $seances->where('statut', 'annulee')->count(),
        ];

        return Pdf::loadView('pdf.monthly-attendance', [
            'month' => $month,
            'year' => $year,
            'period' => $start->translatedFormat('F Y'),
            'seances' => $seances,
            'summary' => $summary,
        ])->setPaper('a4', 'landscape')->download("presence-{$year}-{$month}.pdf");
    }

    public function generateMonthlyAbsencesPDF(int $month, int $year)
    {
        [$start, $end] = $this->period($month, $year);

        $absences = Absence::with(['patient', 'seance', 'declarant'])
            ->whereBetween('date_absence', [$start->toDateString(), $end->toDateString()])
            ->orderBy('date_absence')
            ->get();

        $summary = [
            'total' => $absences->count(),
            'justifiees' => $absences->where('justifiee', true)->count(),
            'non_justifiees' => $absences->where('justifiee', false)->count(),
            'par_motif' => $absences->groupBy('motif')->map->count(),
        ];

        return Pdf::loadView('pdf.monthly-absences', [
            'month' => $month,
            'year' => $year,
            'period' => $start->translatedFormat('F Y'),
            'absences' => $absences,
            'summary' => $summary,
        ])->setPaper('a4', 'landscape')->download("absences-{$year}-{$month}.pdf");
    }

    public function generatePatientFichePDF(int $patientId)
    {
        $patient = Patient::with(['nephrologue', 'seances.machine', 'seances.infirmier', 'absences'])
            ->withCount(['seances', 'absences'])
            ->findOrFail($patientId);

        return Pdf::loadView('pdf.patient-fiche', [
            'patient' => $patient,
            'generatedAt' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4')->download("fiche-patient-{$patient->cin}.pdf");
    }

    public function exportAbsencesExcel(array $filters = []): BinaryFileResponse
    {
        $rows = Absence::with(['patient', 'seance', 'declarant'])
            ->when($filters['patient_id'] ?? null, fn ($query, $patientId) => $query->where('patient_id', $patientId))
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('date_absence', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('date_absence', '<=', $to))
            ->when($filters['motif'] ?? null, fn ($query, $motif) => $query->where('motif', $motif))
            ->when(array_key_exists('justifiee', $filters) && $filters['justifiee'] !== null, fn ($query) => $query->where('justifiee', filter_var($filters['justifiee'], FILTER_VALIDATE_BOOLEAN)))
            ->orderByDesc('date_absence')
            ->get()
            ->map(fn (Absence $absence) => [
                'date_absence' => $absence->date_absence?->format('d/m/Y'),
                'cin' => $absence->patient?->cin,
                'patient' => $absence->patient?->nom_complet,
                'motif' => $absence->motif,
                'justifiee' => $absence->justifiee ? 'Oui' : 'Non',
                'seance' => $absence->seance?->date_seance?->format('d/m/Y'),
                'declare_par' => $absence->declarant?->nom_complet,
                'notes' => $absence->notes,
            ]);

        return Excel::download($this->export($rows, [
            'Date absence',
            'CIN',
            'Patient',
            'Motif',
            'Justifiee',
            'Seance',
            'Declare par',
            'Notes',
        ]), 'absences.xlsx');
    }

    public function exportCNSSExcel(int $month, int $year): BinaryFileResponse
    {
        [$start, $end] = $this->period($month, $year);

        $rows = Patient::withCount([
            'seances as seances_effectuees_count' => fn ($query) => $query
                ->where('statut', 'effectuee')
                ->whereBetween('date_seance', [$start->toDateString(), $end->toDateString()]),
        ])
            ->where('actif', true)
            ->orderBy('nom')
            ->get()
            ->map(fn (Patient $patient) => [
                'cin' => $patient->cin,
                'nom' => $patient->nom,
                'prenom' => $patient->prenom,
                'date_naissance' => $patient->date_naissance?->format('d/m/Y'),
                'periode' => $start->format('m/Y'),
                'nombre_seances' => $patient->seances_effectuees_count,
                'centre' => config('app.name'),
            ]);

        return Excel::download($this->export($rows, [
            'CIN',
            'Nom',
            'Prenom',
            'Date naissance',
            'Periode',
            'Nombre seances',
            'Centre',
        ]), "cnss-amo-{$year}-{$month}.xlsx");
    }

    private function period(int $month, int $year): array
    {
        $start = Carbon::create($year, $month, 1)->startOfMonth();

        return [$start, $start->copy()->endOfMonth()];
    }

    private function export(Collection $rows, array $headings): FromCollection&WithHeadings
    {
        return new class($rows, $headings) implements FromCollection, WithHeadings {
            public function __construct(private readonly Collection $rows, private readonly array $headings)
            {
            }

            public function collection(): Collection
            {
                return $this->rows;
            }

            public function headings(): array
            {
                return $this->headings;
            }
        };
    }
}
