<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SeanceResource;
use App\Models\Absence;
use App\Models\Machine;
use App\Models\Patient;
use App\Models\Seance;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function stats(): JsonResponse
    {
        $start = now()->startOfMonth();
        $end = now()->endOfMonth();
        $monthlySeances = Seance::whereBetween('date_seance', [$start, $end])->count();
        $monthlyAbsences = Absence::whereBetween('date_absence', [$start, $end])->count();

        return $this->success([
            'patients_actifs' => Patient::where('actif', true)->count(),
            'seances_aujourdhui' => Seance::whereDate('date_seance', today())->count(),
            'absences_ce_mois' => $monthlyAbsences,
            'machines_disponibles' => Machine::where('statut', 'disponible')->count(),
            'taux_absence_mois' => $monthlySeances + $monthlyAbsences === 0 ? 0 : round(($monthlyAbsences / ($monthlySeances + $monthlyAbsences)) * 100, 2),
            'seances_du_jour' => SeanceResource::collection(Seance::with(['patient', 'machine', 'infirmier'])->whereDate('date_seance', today())->orderBy('heure_debut')->get())->resolve(request()),
        ], 'Statistiques tableau de bord recuperees');
    }

    public function weeklyAttendance(): JsonResponse
    {
        $start = Carbon::now()->startOfWeek();
        $days = collect(range(0, 5))->map(function (int $offset) use ($start): array {
            $day = $start->copy()->addDays($offset);
            $seances = Seance::whereDate('date_seance', $day->toDateString())->get();

            return [
                'date' => $day->toDateString(),
                'jour' => ucfirst($day->translatedFormat('D')),
                'effectuees' => $seances->where('statut', 'effectuee')->count(),
                'planifiees' => $seances->where('statut', 'planifiee')->count(),
                'annulees' => $seances->where('statut', 'annulee')->count(),
            ];
        });

        return $this->success($days, 'Frequentation hebdomadaire recuperee');
    }

    public function alerts(): JsonResponse
    {
        $start = now()->startOfMonth();
        $end = now()->endOfMonth();

        $alerts = Absence::with('patient')
            ->whereBetween('date_absence', [$start, $end])
            ->get()
            ->groupBy('patient_id')
            ->filter(fn ($absences) => $absences->count() >= 3)
            ->map(fn ($absences) => [
                'patient_id' => $absences->first()->patient_id,
                'patient' => $absences->first()->patient?->nom_complet,
                'cin' => $absences->first()->patient?->cin,
                'nombre_absences' => $absences->count(),
                'derniere_absence' => $absences->sortByDesc('date_absence')->first()->date_absence?->toDateString(),
            ])
            ->values();

        return $this->success($alerts, 'Alertes recuperees avec succes');
    }
}
