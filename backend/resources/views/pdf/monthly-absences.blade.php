<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Resume mensuel des absences</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 11px; }
        h1 { color: #1e3a5f; margin: 0 0 4px; font-size: 22px; }
        h2 { color: #1e3a5f; margin: 18px 0 8px; font-size: 14px; }
        .muted { color: #64748b; }
        .summary { width: 100%; margin: 16px 0; border-collapse: collapse; }
        .summary td { border: 1px solid #cbd5e1; padding: 9px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a5f; color: #fff; text-align: left; padding: 7px; }
        td { border: 1px solid #dbe3ef; padding: 6px; vertical-align: top; }
        .danger { color: #dc2626; font-weight: bold; }
        .ok { color: #16a34a; font-weight: bold; }
        .footer { margin-top: 18px; color: #64748b; font-size: 10px; }
    </style>
</head>
<body>
    <h1>Resume mensuel des absences</h1>
    <div class="muted">{{ config('app.name') }} - {{ $period }}</div>

    <table class="summary">
        <tr>
            <td><strong>Total absences</strong><br>{{ $summary['total'] }}</td>
            <td><strong>Justifiees</strong><br>{{ $summary['justifiees'] }}</td>
            <td><strong>Non justifiees</strong><br>{{ $summary['non_justifiees'] }}</td>
            <td><strong>Motifs</strong><br>
                @foreach ($summary['par_motif'] as $motif => $count)
                    {{ $motif }}: {{ $count }}@if (! $loop->last), @endif
                @endforeach
            </td>
        </tr>
    </table>

    <h2>Detail des absences</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>CIN</th>
                <th>Motif</th>
                <th>Justifiee</th>
                <th>Declare par</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($absences as $absence)
                <tr>
                    <td>{{ $absence->date_absence?->format('d/m/Y') }}</td>
                    <td>{{ $absence->patient?->nom_complet }}</td>
                    <td>{{ $absence->patient?->cin }}</td>
                    <td>{{ $absence->motif }}</td>
                    <td class="{{ $absence->justifiee ? 'ok' : 'danger' }}">{{ $absence->justifiee ? 'Oui' : 'Non' }}</td>
                    <td>{{ $absence->declarant?->nom_complet ?? '-' }}</td>
                    <td>{{ $absence->notes ?? '-' }}</td>
                </tr>
            @empty
                <tr><td colspan="7">Aucune absence pour cette periode.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">Document genere le {{ now()->format('d/m/Y H:i') }}</div>
</body>
</html>
