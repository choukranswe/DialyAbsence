import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { todayIso } from '../../lib/utils';
import type { Absence, AbsencePayload, Patient, Seance } from '../../types';

const schema = z.object({
  patient_id: z.coerce.number().min(1, 'Patient requis'),
  seance_id: z.coerce.number().optional().nullable(),
  date_absence: z.string().min(1, 'Date requise'),
  motif: z.enum(['medical', 'personnel', 'hospitalise', 'autre']),
  justifiee: z.boolean(),
  notes: z.string().optional().nullable(),
});

type AbsenceInput = z.input<typeof schema>;
type AbsenceValues = z.output<typeof schema>;

interface AbsenceFormProps {
  open: boolean;
  absence?: Absence | null;
  patients: Patient[];
  seances: Seance[];
  loading?: boolean;
  onSubmit: (payload: AbsencePayload) => void;
  onClose: () => void;
}

const defaults: AbsenceValues = {
  patient_id: 0,
  seance_id: null,
  date_absence: todayIso(),
  motif: 'medical',
  justifiee: false,
  notes: '',
};

export function AbsenceForm({ open, absence, patients, seances, loading, onSubmit, onClose }: AbsenceFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AbsenceInput, unknown, AbsenceValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (absence) {
      reset({
        patient_id: absence.patient_id,
        seance_id: absence.seance_id ?? null,
        date_absence: absence.date_absence,
        motif: absence.motif,
        justifiee: absence.justifiee,
        notes: absence.notes ?? '',
      });
    } else {
      reset(defaults);
    }
  }, [absence, open, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8">
      <div role="dialog" aria-modal="true" className="mx-auto w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#072C73]">{absence ? 'Modifier absence' : 'Declarer une absence'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((values) => onSubmit({ ...values, seance_id: values.seance_id || null, notes: values.notes || null }))} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Patient" error={errors.patient_id?.message}>
              <select className="input" {...register('patient_id')}>
                <option value={0}>Selectionner</option>
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.nom_complet}</option>)}
              </select>
            </Field>
            <Field label="Seance liee">
              <select className="input" {...register('seance_id')}>
                <option value="">Aucune</option>
                {seances.map((seance) => <option key={seance.id} value={seance.id}>{seance.date_seance} - {seance.patient?.nom_complet}</option>)}
              </select>
            </Field>
            <Field label="Date absence" error={errors.date_absence?.message}><input type="date" className="input" {...register('date_absence')} /></Field>
            <Field label="Motif">
              <select className="input" {...register('motif')}>
                <option value="medical">Medical</option>
                <option value="personnel">Personnel</option>
                <option value="hospitalise">Hospitalise</option>
                <option value="autre">Autre</option>
              </select>
            </Field>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('justifiee')} />
            Absence justifiee
          </label>

          <Field label="Notes"><textarea className="input min-h-24" {...register('notes')} /></Field>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={loading} className="rounded-md bg-[#0A4FAF] px-4 py-2 text-sm font-bold text-white hover:bg-[#072C73] disabled:opacity-60">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs font-semibold text-[#DC2626]">{error}</span>}
    </label>
  );
}
