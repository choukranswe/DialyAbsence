<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Rapport mensuel de presence</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 11px; }
        h1 { color: #072c73; margin: 0 0 4px; font-size: 22px; }
        h2 { color: #072c73; margin: 18px 0 8px; font-size: 14px; }
        .muted { color: #64748b; }
        .report-header { border-bottom: 2px solid #0a4faf; margin-bottom: 14px; padding-bottom: 10px; }
        .logo { height: 46px; margin-bottom: 8px; }
        .center-name { color: #072c73; font-weight: bold; }
        .summary { width: 100%; margin: 16px 0; border-collapse: collapse; }
        .summary td { border: 1px solid #cbd5e1; padding: 9px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #0a4faf; color: #fff; text-align: left; padding: 7px; }
        td { border: 1px solid #dbe3ef; padding: 6px; vertical-align: top; }
        .status { font-weight: bold; text-transform: uppercase; }
        .effectuee { color: #16a34a; }
        .planifiee { color: #d97706; }
        .annulee { color: #dc2626; }
        .footer { margin-top: 18px; color: #64748b; font-size: 10px; }
    </style>
</head>
<body>
    @php($center = config('center'))
    @php($logo = is_file($center['logo_path']) ? 'data:image/png;base64,'.base64_encode(file_get_contents($center['logo_path'])) : null)

    <div class="report-header">
        @if ($logo)
            <img class="logo" src="{{ $logo }}" alt="{{ $center['name'] }}">
        @endif
        <h1>Rapport mensuel de presence</h1>
        <div class="muted"><span class="center-name">{{ $center['name'] }}</span> - {{ $center['city'] }} - Médecin responsable: {{ $center['responsible_doctor'] }}</div>
        <div class="muted">{{ $period }}@if ($organisme) - Organisme: {{ $organisme }}@endif</div>
    </div>

    <table class="summary">
        <tr>
            <td><strong>Total seances</strong><br>{{ $summary['total'] }}</td>
            <td><strong>Effectuees</strong><br>{{ $summary['effectuees'] }}</td>
            <td><strong>Planifiees</strong><br>{{ $summary['planifiees'] }}</td>
            <td><strong>Annulees</strong><br>{{ $summary['annulees'] }}</td>
        </tr>
    </table>

    <h2>Detail des seances</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Patient</th>
                <th>CIN</th>
                <th>Organisme</th>
                <th>Machine</th>
                <th>Infirmier</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($seances as $seance)
                <tr>
                    <td>{{ $seance->date_seance?->format('d/m/Y') }}</td>
                    <td>{{ substr($seance->heure_debut, 0, 5) }} - {{ substr($seance->heure_fin, 0, 5) }}</td>
                    <td>{{ $seance->patient?->nom_complet }}</td>
                    <td>{{ $seance->patient?->cin }}</td>
                    <td>{{ $seance->patient?->organisme ?? '-' }}</td>
                    <td>{{ $seance->machine?->numero }}</td>
                    <td>{{ $seance->nurse?->full_name ?? '-' }}</td>
                    <td class="status {{ $seance->statut }}">{{ $seance->statut }}</td>
                </tr>
            @empty
                <tr><td colspan="8">Aucune seance pour cette periode.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">{{ $center['name'] }} - {{ $center['city'] }} - Document genere le {{ now()->format('d/m/Y H:i') }}</div>
</body>
</html>
