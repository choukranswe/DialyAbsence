import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AbsenceMotif, LeaveStatus, LeaveType, MachineStatut, NurseStatus, SeanceStatut } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-MA').format(new Date(value));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-MA').format(value);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function minutesBetween(start: string, end: string): number {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return Math.max(0, endHour * 60 + endMinute - (startHour * 60 + startMinute));
}

export const seanceLabels: Record<SeanceStatut, string> = {
  planifiee: 'Planifiee',
  effectuee: 'Effectuee',
  annulee: 'Annulee',
};

export const absenceLabels: Record<AbsenceMotif, string> = {
  medical: 'Medical',
  personnel: 'Personnel',
  hospitalise: 'Hospitalise',
  autre: 'Autre',
};

export const machineLabels: Record<MachineStatut, string> = {
  disponible: 'Disponible',
  en_utilisation: 'En utilisation',
  maintenance: 'Maintenance',
  hors_service: 'Hors service',
};

export const nurseStatusLabels: Record<NurseStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
};

export const leaveTypeLabels: Record<LeaveType, string> = {
  annual_leave: 'Conge annuel',
  sick_leave: 'Conge maladie',
  exceptional_leave: 'Conge exceptionnel',
  vacation: 'Vacances',
  rest_day: 'Jour de repos',
};

export const leaveStatusLabels: Record<LeaveStatus, string> = {
  pending: 'En attente',
  approved: 'Approuve',
  refused: 'Refuse',
  cancelled: 'Annule',
};

export const organismeOptions = [
  { value: 'CNSS', label: 'CNSS' },
  { value: 'CNOPS', label: 'CNOPS' },
  { value: 'AMO', label: 'AMO' },
  { value: 'AMO&CNSS', label: 'AMO&CNSS' },
  { value: 'FAR', label: 'FAR' },
  { value: 'Assurance privée', label: 'Assurance privée' },
  { value: 'Sans couverture', label: 'Sans couverture' },
];

export function monthOptions() {
  return Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Intl.DateTimeFormat('fr-MA', { month: 'long' }).format(new Date(2026, index, 1)),
  }));
}
