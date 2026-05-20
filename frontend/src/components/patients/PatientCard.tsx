import { Calendar, Droplet, MapPin, Phone, UserRound } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { Patient } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';

export function PatientCard({ patient }: { patient: Patient }) {
  const items = [
    { icon: UserRound, label: 'CIN', value: patient.cin },
    { icon: Phone, label: 'Telephone', value: patient.telephone },
    { icon: MapPin, label: 'Ville', value: patient.ville },
    { icon: Calendar, label: 'Entree', value: formatDate(patient.date_entree) },
    { icon: Droplet, label: 'Groupe', value: patient.groupe_sanguin },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-clinic">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A5F]">{patient.nom_complet}</h2>
          <p className="text-sm text-slate-500">
            {patient.age} ans - {patient.sexe === 'M' ? 'Masculin' : 'Feminin'}
          </p>
        </div>
        <StatusBadge type="patient" value={patient.actif} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
              <Icon className="h-4 w-4" />
              {label}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-bold uppercase text-slate-500">Cause insuffisance renale</div>
          <p className="mt-1 text-sm text-slate-700">{patient.cause_insuffisance_renale}</p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase text-slate-500">Nephrologue</div>
          <p className="mt-1 text-sm text-slate-700">{patient.nephrologue?.nom_complet ?? '-'}</p>
        </div>
      </div>
    </section>
  );
}
