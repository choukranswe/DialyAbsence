import { CalendarPlus, Clock, Monitor } from 'lucide-react';
import { cn, seanceLabels, toIsoDate } from '../../lib/utils';
import type { Seance } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';

const shifts = [
  { key: 'matin', label: 'Matin', start: '07:00', end: '11:00' },
  { key: 'midi', label: 'Milieu journee', start: '11:00', end: '15:00' },
  { key: 'soir', label: 'Apres-midi', start: '15:00', end: '19:00' },
];

interface SeanceCalendarProps {
  startDate: string;
  seances: Seance[];
  onEdit: (seance: Seance) => void;
  onCreate: (date: string, start: string, end: string) => void;
}

export function SeanceCalendar({ startDate, seances, onEdit, onCreate }: SeanceCalendarProps) {
  const days = weekDays(startDate);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="grid grid-cols-[150px_repeat(6,minmax(150px,1fr))] border-b border-slate-200 bg-slate-50">
        <div className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Shift</div>
        {days.map((day) => (
          <div key={day.iso} className="border-l border-slate-200 px-4 py-3">
            <div className="text-sm font-bold text-[#072C73]">{day.label}</div>
            <div className="text-xs text-slate-500">{day.display}</div>
          </div>
        ))}
      </div>

      {shifts.map((shift) => (
        <div key={shift.key} className="grid min-h-[150px] grid-cols-[150px_repeat(6,minmax(150px,1fr))] border-b border-slate-100 last:border-b-0">
          <div className="flex flex-col justify-center gap-2 bg-slate-50 px-4">
            <div className="font-bold text-[#072C73]">{shift.label}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {shift.start} - {shift.end}
            </div>
          </div>
          {days.map((day) => {
            const slotSeances = seances.filter((seance) => seance.date_seance === day.iso && belongsToShift(seance.heure_debut, shift.start, shift.end));
            return (
              <div key={`${day.iso}-${shift.key}`} className="space-y-2 border-l border-slate-100 p-3">
                <button
                  type="button"
                  onClick={() => onCreate(day.iso, shift.start, shift.end)}
                  className="flex h-8 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-xs font-bold text-slate-500 transition hover:border-[#0A4FAF] hover:text-[#0A4FAF]"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Ajouter
                </button>
                {slotSeances.map((seance) => (
                  <button
                    key={seance.id}
                    type="button"
                    onClick={() => onEdit(seance)}
                    className={cn(
                      'w-full rounded-md border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm',
                      seance.statut === 'effectuee' && 'border-green-200 bg-green-50',
                      seance.statut === 'planifiee' && 'border-amber-200 bg-amber-50',
                      seance.statut === 'annulee' && 'border-red-200 bg-red-50',
                    )}
                  >
                    <div className="truncate text-sm font-bold text-[#072C73]">{seance.patient?.nom_complet}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                      <Monitor className="h-3.5 w-3.5" />
                      {seance.machine?.numero} - {seance.nurse?.full_name ?? 'Non assigne'}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-600">{seance.heure_debut}</span>
                      <StatusBadge type="seance" value={seance.statut} />
                    </div>
                    <div className="sr-only">{seanceLabels[seance.statut]}</div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function weekDays(startDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  return Array.from({ length: 6 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return {
      iso: toIsoDate(day),
      label: new Intl.DateTimeFormat('fr-MA', { weekday: 'long' }).format(day),
      display: new Intl.DateTimeFormat('fr-MA', { day: '2-digit', month: 'short' }).format(day),
    };
  });
}

function belongsToShift(time: string, start: string, end: string): boolean {
  return time >= start && time < end;
}
