import { cn, leaveStatusLabels, machineLabels, nurseStatusLabels, seanceLabels } from '../../lib/utils';
import type { LeaveStatus, MachineStatut, NurseStatus, SeanceStatut } from '../../types';

type BadgeTone = 'green' | 'amber' | 'red' | 'blue' | 'slate';

const tones: Record<BadgeTone, string> = {
  green: 'border-green-200 bg-green-50 text-green-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  blue: 'border-blue-200 bg-blue-50 text-[#0A4FAF]',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
};

interface StatusBadgeProps {
  type: 'seance' | 'machine' | 'patient' | 'absence' | 'nurse' | 'leave';
  value: string | boolean;
}

export function StatusBadge({ type, value }: StatusBadgeProps) {
  const config = getConfig(type, value);

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold', tones[config.tone])}>
      <span className={cn('h-2 w-2 rounded-full', dotColor(config.tone))} />
      {config.label}
    </span>
  );
}

function getConfig(type: StatusBadgeProps['type'], value: string | boolean): { label: string; tone: BadgeTone } {
  if (type === 'patient') {
    return value ? { label: 'Actif', tone: 'green' } : { label: 'Archive', tone: 'red' };
  }

  if (type === 'absence') {
    return value ? { label: 'Justifiee', tone: 'green' } : { label: 'Non justifiee', tone: 'red' };
  }

  if (type === 'seance') {
    const statut = value as SeanceStatut;
    return {
      label: seanceLabels[statut] ?? String(value),
      tone: statut === 'effectuee' ? 'green' : statut === 'annulee' ? 'red' : 'amber',
    };
  }

  if (type === 'nurse') {
    const statut = value as NurseStatus;
    return {
      label: nurseStatusLabels[statut] ?? String(value),
      tone: statut === 'active' ? 'green' : 'red',
    };
  }

  if (type === 'leave') {
    const statut = value as LeaveStatus;
    return {
      label: leaveStatusLabels[statut] ?? String(value),
      tone: statut === 'approved' ? 'green' : statut === 'refused' || statut === 'cancelled' ? 'red' : 'amber',
    };
  }

  const statut = value as MachineStatut;
  return {
    label: machineLabels[statut] ?? String(value),
    tone: statut === 'disponible' ? 'green' : statut === 'maintenance' ? 'amber' : statut === 'hors_service' ? 'red' : 'blue',
  };
}

function dotColor(tone: BadgeTone): string {
  return {
    green: 'bg-[#16A34A]',
    amber: 'bg-[#D97706]',
    red: 'bg-[#DC2626]',
    blue: 'bg-[#2F7ED8]',
    slate: 'bg-slate-500',
  }[tone];
}
