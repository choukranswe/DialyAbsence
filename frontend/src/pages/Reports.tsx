import { Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { downloadReport, periodQuery } from '../api/reports';
import { monthOptions } from '../lib/utils';

export function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const query = periodQuery(month, year);

  const reports = [
    {
      title: 'Rapport mensuel de presence',
      description: 'PDF des seances planifiees, effectuees et annulees.',
      icon: FileText,
      action: () => downloadReport(`/reports/monthly-attendance?${query}`, `presence-${year}-${month}.pdf`),
    },
    {
      title: 'Resume mensuel des absences',
      description: 'PDF detaille par patient, motif et justification.',
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
            Periode selectionnee pour les rapports mensuels
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
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
