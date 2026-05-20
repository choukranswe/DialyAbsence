import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { downloadReport } from '../api/reports';
import { fetchPatient, fetchPatientAbsences, fetchPatientSeances, fetchPatientStats } from '../api/patients';
import { PatientCard } from '../components/patients/PatientCard';
import { DataTable, type DataColumn } from '../components/shared/DataTable';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { StatusBadge } from '../components/shared/StatusBadge';
import { absenceLabels, formatDate } from '../lib/utils';
import type { Absence, Seance } from '../types';

export function PatientDetail() {
  const navigate = useNavigate();
  const id = Number(useParams().id);
  const patientQuery = useQuery({ queryKey: ['patients', id], queryFn: () => fetchPatient(id), enabled: Number.isFinite(id) });
  const statsQuery = useQuery({ queryKey: ['patients', id, 'stats'], queryFn: () => fetchPatientStats(id), enabled: Number.isFinite(id) });
  const seancesQuery = useQuery({ queryKey: ['patients', id, 'seances'], queryFn: () => fetchPatientSeances(id), enabled: Number.isFinite(id) });
  const absencesQuery = useQuery({ queryKey: ['patients', id, 'absences'], queryFn: () => fetchPatientAbsences(id), enabled: Number.isFinite(id) });

  const seanceColumns: DataColumn<Seance>[] = [
    { key: 'date', header: 'Date', render: (seance) => formatDate(seance.date_seance), sortValue: (seance) => seance.date_seance, sortable: true },
    { key: 'heure', header: 'Heure', render: (seance) => `${seance.heure_debut} - ${seance.heure_fin}` },
    { key: 'machine', header: 'Machine', render: (seance) => seance.machine?.numero },
    { key: 'infirmier', header: 'Infirmier', render: (seance) => seance.infirmier?.nom_complet ?? '-' },
    { key: 'statut', header: 'Statut', render: (seance) => <StatusBadge type="seance" value={seance.statut} /> },
  ];

  const absenceColumns: DataColumn<Absence>[] = [
    { key: 'date', header: 'Date', render: (absence) => formatDate(absence.date_absence), sortValue: (absence) => absence.date_absence, sortable: true },
    { key: 'motif', header: 'Motif', render: (absence) => absenceLabels[absence.motif] },
    { key: 'justifiee', header: 'Justification', render: (absence) => <StatusBadge type="absence" value={absence.justifiee} /> },
    { key: 'notes', header: 'Notes', render: (absence) => absence.notes ?? '-' },
  ];

  if (patientQuery.isLoading) {
    return <LoadingSkeleton rows={8} />;
  }

  if (!patientQuery.data) {
    return <div className="surface p-6 text-sm text-slate-500">Patient introuvable.</div>;
  }

  const patient = patientQuery.data;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => downloadReport(`/reports/patient-fiche/${patient.id}`, `fiche-${patient.cin}.pdf`).catch((error) => toast.error(error.message))}
        >
          <Download className="h-4 w-4" />
          Fiche PDF
        </button>
      </div>

      <PatientCard patient={patient} />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Seances" value={statsQuery.data?.total_seances ?? 0} />
        <Metric label="Effectuees" value={statsQuery.data?.seances_effectuees ?? 0} />
        <Metric label="Absences" value={statsQuery.data?.absences_total ?? 0} danger />
        <Metric label="Presence" value={`${statsQuery.data?.taux_presence ?? 0}%`} />
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#1E3A5F]">Historique seances</h2>
        <DataTable data={seancesQuery.data?.data ?? []} columns={seanceColumns} getRowKey={(seance) => seance.id} loading={seancesQuery.isLoading} empty={<div className="surface p-6 text-sm text-slate-500">Aucune seance.</div>} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#1E3A5F]">Absences</h2>
        <DataTable data={absencesQuery.data?.data ?? []} columns={absenceColumns} getRowKey={(absence) => absence.id} loading={absencesQuery.isLoading} empty={<div className="surface p-6 text-sm text-slate-500">Aucune absence.</div>} />
      </section>
    </div>
  );
}

function Metric({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="surface p-5">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${danger ? 'text-[#DC2626]' : 'text-[#1E3A5F]'}`}>{value}</div>
    </div>
  );
}
