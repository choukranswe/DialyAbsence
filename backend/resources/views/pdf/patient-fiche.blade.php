<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Fiche patient</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 11px; }
        h1 { color: #1e3a5f; margin: 0 0 4px; font-size: 22px; }
        h2 { color: #1e3a5f; margin: 18px 0 8px; font-size: 14px; }
        .muted { color: #64748b; }
        .grid { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .grid td { border: 1px solid #dbe3ef; padding: 8px; width: 25%; vertical-align: top; }
        .label { color: #475569; font-size: 10px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e3a5f; color: #fff; text-align: left; padding: 7px; }
        td { border: 1px solid #dbe3ef; padding: 6px; vertical-align: top; }
        .footer { margin-top: 18px; color: #64748b; font-size: 10px; }
    </style>
</head>
<body>
    <h1>Fiche complete patient</h1>
    <div class="muted">{{ config('app.name') }} - Generee le {{ $generatedAt }}</div>

    <table class="grid">
        <tr>
            <td><span class="label">Patient</span><br><strong>{{ $patient->nom_complet }}</strong></td>
            <td><span class="label">CIN</span><br>{{ $patient->cin }}</td>
            <td><span class="label">Age</span><br>{{ $patient->date_naissance?->age }} ans</td>
            <td><span class="label">Sexe</span><br>{{ $patient->sexe }}</td>
        </tr>
        <tr>
            <td><span class="label">Telephone</span><br>{{ $patient->telephone }}</td>
            <td><span class="label">Ville</span><br>{{ $patient->ville }}</td>
            <td><span class="label">Groupe sanguin</span><br>{{ $patient->groupe_sanguin }}</td>
            <td><span class="label">Nephrologue</span><br>{{ $patient->nephrologue?->nom_complet ?? '-' }}</td>
        </tr>
        <tr>
            <td><span class="label">Poids</span><br>{{ $patient->poids }} kg</td>
            <td><span class="label">Taille</span><br>{{ $patient->taille }} cm</td>
            <td><span class="label">Date entree</span><br>{{ $patient->date_entree?->format('d/m/Y') }}</td>
            <td><span class="label">Statut</span><br>{{ $patient->actif ? 'Actif' : 'Archive' }}</td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">Adresse</span><br>{{ $patient->adresse }}</td>
            <td colspan="2"><span class="label">Cause insuffisance renale</span><br>{{ $patient->cause_insuffisance_renale }}</td>
        </tr>
    </table>

    <h2>Historique des seances recentes</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Machine</th>
                <th>Infirmier</th>
                <th>Statut</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($patient->seances->sortByDesc('date_seance')->take(15) as $seance)
                <tr>
                    <td>{{ $seance->date_seance?->format('d/m/Y') }}</td>
                    <td>{{ substr($seance->heure_debut, 0, 5) }} - {{ substr($seance->heure_fin, 0, 5) }}</td>
                    <td>{{ $seance->machine?->numero }}</td>
                    <td>{{ $seance->infirmier?->nom_complet ?? '-' }}</td>
                    <td>{{ $seance->statut }}</td>
                </tr>
            @empty
                <tr><td colspan="5">Aucune seance enregistree.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Absences recentes</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Motif</th>
                <th>Justifiee</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($patient->absences->sortByDesc('date_absence')->take(10) as $absence)
                <tr>
                    <td>{{ $absence->date_absence?->format('d/m/Y') }}</td>
                    <td>{{ $absence->motif }}</td>
                    <td>{{ $absence->justifiee ? 'Oui' : 'Non' }}</td>
                    <td>{{ $absence->notes ?? '-' }}</td>
                </tr>
            @empty
                <tr><td colspan="4">Aucune absence enregistree.</td></tr>
            @endforelse
        </tbody>
    </table>

    @if ($patient->notes)
        <h2>Notes medicales</h2>
        <p>{{ $patient->notes }}</p>
    @endif

    <div class="footer">Seances totales: {{ $patient->seances_count }} - Absences totales: {{ $patient->absences_count }}</div>
</body>
</html>
