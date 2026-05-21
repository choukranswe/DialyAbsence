import { Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchNurses } from '../api/nurses';
import { fetchPatients } from '../api/patients';
import { downloadReport, periodQuery } from '../api/reports';
import { monthOptions, organismeOptions } from '../lib/utils';

export function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [organisme, setOrganisme] = useState('');
  const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10));
  const [patientId, setPatientId] = useState('');
  const [nurseId, setNurseId] = useState('');
  const patientsQuery = useQuery({ queryKey: ['patients', 'report-list'], queryFn: () => fetchPatients({ statut: 'tous', per_page: 100 }), staleTime: 2 * 60 * 1000 });
  const nursesQuery = useQuery({ queryKey: ['nurses', 'report-list'], queryFn: () => fetchNurses({ status: 'all', per_page: 100 }), staleTime: 2 * 60 * 1000 });
  const query = periodQuery(month, year, organisme);
  const reportFilters = rangeQuery({ from, to, patient_id: patientId, nurse_id: nurseId, organisme });

  const reports = [
    {
      title: 'Patient absences',
      description: 'Export des absences patients filtre par date, patient et organisme.',
      icon: FileSpreadsheet,
      action: () => downloadReport(`/reports/patient-absences?${reportFilters}`, 'patient-absences.xlsx'),
    },
    {
      title: 'Leave reports',
      description: 'Historique des conges du personnel filtre par date et infirmier.',
      icon: FileSpreadsheet,
      action: () => downloadReport(`/reports/leaves?${reportFilters}`, 'leave-reports.xlsx'),
    },
    {
      title: 'Attendance reports',
      description: 'Export des seances filtre par date, patient, infirmier et organisme.',
      icon: FileSpreadsheet,
      action: () => downloadReport(`/reports/attendance?${reportFilters}`, 'attendance-reports.xlsx'),
    },
    {
      title: 'Rapport mensuel de presence',
      description: 'PDF mensuel des seances planifiees, effectuees et annulees.',
      icon: FileText,
      action: () => downloadReport(`/reports/monthly-attendance?${query}`, `presence-${year}-${month}.pdf`),
    },
    {
      title: 'Resume mensuel des absences',
      description: 'PDF mensuel detaille par patient, motif et justification.',
      icon: FileText,
      action: () => downloadReport(`/reports/monthly-absences?${query}`, `absences-${year}-${month}.pdf`),
    },
    {
      title: 'Export CNSS/AMO',
      description: 'Fichier Excel au format de declaration mensuelle.',
      icon: FileSpreadsheet,
      action: () => downloadReport(`/reports/cnss-export?${query}`, `cnss-amo-${year}-${month}.xlsx`),
    },
  ];

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <div className="grid gap-4 md:grid-cols-[180px_180px_1fr_1fr_220px]">
          <label>
            <span className="label">Du</span>
            <input type="date" className="input mt-1" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label>
            <span className="label">Au</span>
            <input type="date" className="input mt-1" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
          <label>
            <span className="label">Patient</span>
            <select className="input mt-1" value={patientId} onChange={(event) => setPatientId(event.target.value)}>
              <option value="">Tous</option>
              {(patientsQuery.data?.data ?? []).map((patient) => <option key={patient.id} value={patient.id}>{patient.nom_complet}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Infirmier</span>
            <select className="input mt-1" value={nurseId} onChange={(event) => setNurseId(event.target.value)}>
              <option value="">Tous</option>
              {(nursesQuery.data?.data ?? []).map((nurse) => <option key={nurse.id} value={nurse.id}>{nurse.full_name}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Organisme</span>
            <select className="input mt-1" value={organisme} onChange={(event) => setOrganisme(event.target.value)}>
              <option value="">Tous</option>
              {organismeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="surface p-5">
        <div className="grid gap-4 md:grid-cols-[220px_160px_1fr]">
          <label>
            <span className="label">Mois</span>
            <select className="input mt-1" value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {monthOptions().map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Annee</span>
            <input type="number" min={2020} max={2100} className="input mt-1" value={year} onChange={(event) => setYear(Number(event.target.value))} />
          </label>
          <div className="flex items-end text-sm text-slate-500">
            <Calendar className="mr-2 h-4 w-4" />
            Periode selectionnee pour les rapports mensuels PDF/CNSS
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map(({ title, description, icon: Icon, action }) => (
          <section key={title} className="surface p-5">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-[#2563EB]">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#1E3A5F]">{title}</h2>
            <p className="mt-2 min-h-12 text-sm text-slate-500">{description}</p>
            <button type="button" className="btn-primary mt-5 w-full" onClick={() => action().catch((error) => toast.error(error.message))}>
              <Download className="h-4 w-4" />
              Telecharger
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}

function rangeQuery(values: Record<string, string>): string {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return params.toString();
}
