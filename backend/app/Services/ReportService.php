<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\NurseLeave;
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
    public function generateMonthlyAttendancePDF(int $month, int $year, array $filters = [])
    {
        [$start, $end] = $this->period($month, $year);
        $organisme = $filters['organisme'] ?? null;

        $seances = Seance::with(['patient', 'machine', 'nurse'])
            ->whereBetween('date_seance', [$start->toDateString(), $end->toDateString()])
            ->when($organisme, fn ($query, $organisme) => $query->whereHas('patient', fn ($query) => $query->where('organisme', $organisme)))
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
            'organisme' => $organisme,
            'seances' => $seances,
            'summary' => $summary,
        ])->setPaper('a4', 'landscape')->download("presence-{$year}-{$month}.pdf");
    }

    public function generateMonthlyAbsencesPDF(int $month, int $year, array $filters = [])
    {
        [$start, $end] = $this->period($month, $year);
        $organisme = $filters['organisme'] ?? null;

        $absences = Absence::with(['patient', 'seance', 'declarant'])
            ->whereBetween('date_absence', [$start->toDateString(), $end->toDateString()])
            ->when($organisme, fn ($query, $organisme) => $query->whereHas('patient', fn ($query) => $query->where('organisme', $organisme)))
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
            'organisme' => $organisme,
            'absences' => $absences,
            'summary' => $summary,
        ])->setPaper('a4', 'landscape')->download("absences-{$year}-{$month}.pdf");
    }

    public function generatePatientFichePDF(int $patientId)
    {
        $patient = Patient::with(['nephrologue', 'assignedMachine', 'seances.machine', 'seances.nurse', 'absences'])
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
            ->when($filters['organisme'] ?? null, fn ($query, $organisme) => $query->whereHas('patient', fn ($query) => $query->where('organisme', $organisme)))
            ->when(array_key_exists('justifiee', $filters) && $filters['justifiee'] !== null, fn ($query) => $query->where('justifiee', filter_var($filters['justifiee'], FILTER_VALIDATE_BOOLEAN)))
            ->orderByDesc('date_absence')
            ->get()
            ->map(fn (Absence $absence) => [
                'date_absence' => $absence->date_absence?->format('d/m/Y'),
                'cin' => $absence->patient?->cin,
                'patient' => $absence->patient?->nom_complet,
                'organisme' => $absence->patient?->organisme,
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
            'Organisme',
            'Motif',
            'Justifiee',
            'Seance',
            'Declare par',
            'Notes',
        ]), 'absences.xlsx');
    }

    public function exportAttendanceExcel(array $filters = []): BinaryFileResponse
    {
        $rows = Seance::with(['patient', 'machine', 'nurse'])
            ->when($filters['patient_id'] ?? null, fn ($query, $patientId) => $query->where('patient_id', $patientId))
            ->when($filters['nurse_id'] ?? null, fn ($query, $nurseId) => $query->where('nurse_id', $nurseId))
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('date_seance', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('date_seance', '<=', $to))
            ->when($filters['organisme'] ?? null, fn ($query, $organisme) => $query->whereHas('patient', fn ($query) => $query->where('organisme', $organisme)))
            ->orderByDesc('date_seance')
            ->orderBy('heure_debut')
            ->get()
            ->map(fn (Seance $seance) => [
                'date_seance' => $seance->date_seance?->format('d/m/Y'),
                'heure_debut' => substr((string) $seance->heure_debut, 0, 5),
                'heure_fin' => substr((string) $seance->heure_fin, 0, 5),
                'patient' => $seance->patient?->nom_complet,
                'cin' => $seance->patient?->cin,
                'organisme' => $seance->patient?->organisme,
                'machine' => $seance->machine?->numero,
                'infirmier' => $seance->nurse?->full_name,
                'statut' => $seance->statut,
                'observations' => $seance->observations,
            ]);

        return Excel::download($this->export($rows, [
            'Date seance',
            'Debut',
            'Fin',
            'Patient',
            'CIN',
            'Organisme',
            'Machine',
            'Infirmier',
            'Statut',
            'Observations',
        ]), 'attendance.xlsx');
    }

    public function exportLeavesExcel(array $filters = []): BinaryFileResponse
    {
        $rows = NurseLeave::with(['nurse', 'approver'])
            ->when($filters['nurse_id'] ?? null, fn ($query, $nurseId) => $query->where('nurse_id', $nurseId))
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('end_date', '>=', $from))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('start_date', '<=', $to))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->orderByDesc('start_date')
            ->get()
            ->map(fn (NurseLeave $leave) => [
                'infirmier' => $leave->nurse?->full_name,
                'debut' => $leave->start_date?->format('d/m/Y'),
                'fin' => $leave->end_date?->format('d/m/Y'),
                'type' => $leave->leave_type,
                'statut' => $leave->status,
                'approuve_par' => $leave->approver?->nom_complet,
                'motif' => $leave->reason,
                'notes' => $leave->notes,
            ]);

        return Excel::download($this->export($rows, [
            'Infirmier',
            'Debut',
            'Fin',
            'Type',
            'Statut',
            'Approuve par',
            'Motif',
            'Notes',
        ]), 'conges-personnel.xlsx');
    }

    public function exportCNSSExcel(int $month, int $year, array $filters = []): BinaryFileResponse
    {
        [$start, $end] = $this->period($month, $year);
        $organisme = $filters['organisme'] ?? null;

        $rows = Patient::withCount([
            'seances as seances_effectuees_count' => fn ($query) => $query
                ->where('statut', 'effectuee')
                ->whereBetween('date_seance', [$start->toDateString(), $end->toDateString()]),
        ])
            ->where('actif', true)
            ->when($organisme, fn ($query, $organisme) => $query->where('organisme', $organisme))
            ->orderBy('nom')
            ->get()
            ->map(fn (Patient $patient) => [
                'cin' => $patient->cin,
                'nom' => $patient->nom,
                'prenom' => $patient->prenom,
                'organisme' => $patient->organisme,
                'numero_assurance' => $patient->insurance_number,
                'type_couverture' => $patient->coverage_type,
                'expiration_couverture' => $patient->coverage_expiration?->format('d/m/Y'),
                'date_naissance' => $patient->date_naissance?->format('d/m/Y'),
                'periode' => $start->format('m/Y'),
                'nombre_seances' => $patient->seances_effectuees_count,
                'centre' => config('app.name'),
            ]);

        return Excel::download($this->export($rows, [
            'CIN',
            'Nom',
            'Prenom',
            'Organisme',
            'Numero assurance',
            'Type couverture',
            'Expiration couverture',
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
