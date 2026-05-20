import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { minutesBetween, todayIso } from '../../lib/utils';
import type { Machine, Patient, Seance, SeancePayload, User } from '../../types';

const schema = z.object({
  patient_id: z.coerce.number().min(1, 'Patient requis'),
  machine_id: z.coerce.number().min(1, 'Machine requise'),
  infirmier_id: z.coerce.number().optional().nullable(),
  date_seance: z.string().min(1, 'Date requise'),
  heure_debut: z.string().min(1, 'Heure debut requise'),
  heure_fin: z.string().min(1, 'Heure fin requise'),
  duree_minutes: z.coerce.number().min(30),
  statut: z.enum(['planifiee', 'effectuee', 'annulee']),
  tension_avant: z.string().optional().nullable(),
  tension_apres: z.string().optional().nullable(),
  poids_avant: z.coerce.number().optional().nullable(),
  poids_apres: z.coerce.number().optional().nullable(),
  poids_sec: z.coerce.number().optional().nullable(),
  observations: z.string().optional().nullable(),
});

type SeanceFormInput = z.input<typeof schema>;
type SeanceFormValues = z.output<typeof schema>;

interface SeanceFormProps {
  open: boolean;
  seance?: Seance | null;
  patients: Patient[];
  machines: Machine[];
  infirmiers: User[];
  initialSlot?: { date: string; start: string; end: string } | null;
  loading?: boolean;
  onSubmit: (payload: SeancePayload) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const defaults: SeanceFormValues = {
  patient_id: 0,
  machine_id: 0,
  infirmier_id: null,
  date_seance: todayIso(),
  heure_debut: '07:00',
  heure_fin: '11:00',
  duree_minutes: 240,
  statut: 'planifiee',
  tension_avant: '',
  tension_apres: '',
  poids_avant: null,
  poids_apres: null,
  poids_sec: null,
  observations: '',
};

export function SeanceForm({ open, seance, patients, machines, infirmiers, initialSlot, loading, onSubmit, onDelete, onClose }: SeanceFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SeanceFormInput, unknown, SeanceFormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  const start = watch('heure_debut');
  const end = watch('heure_fin');

  useEffect(() => {
    if (start && end) {
      setValue('duree_minutes', minutesBetween(start, end), { shouldValidate: true });
    }
  }, [end, setValue, start]);

  useEffect(() => {
    if (seance) {
      reset({
        patient_id: seance.patient_id,
        machine_id: seance.machine_id,
        infirmier_id: seance.infirmier_id ?? null,
        date_seance: seance.date_seance,
        heure_debut: seance.heure_debut,
        heure_fin: seance.heure_fin,
        duree_minutes: seance.duree_minutes,
        statut: seance.statut,
        tension_avant: seance.tension_avant ?? '',
        tension_apres: seance.tension_apres ?? '',
        poids_avant: seance.poids_avant ? Number(seance.poids_avant) : null,
        poids_apres: seance.poids_apres ? Number(seance.poids_apres) : null,
        poids_sec: seance.poids_sec ? Number(seance.poids_sec) : null,
        observations: seance.observations ?? '',
      });
    } else if (initialSlot) {
      reset({ ...defaults, date_seance: initialSlot.date, heure_debut: initialSlot.start, heure_fin: initialSlot.end, duree_minutes: minutesBetween(initialSlot.start, initialSlot.end) });
    } else {
      reset(defaults);
    }
  }, [initialSlot, open, reset, seance]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8">
      <div role="dialog" aria-modal="true" className="mx-auto w-full max-w-4xl rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#1E3A5F]">{seance ? 'Modifier seance' : 'Nouvelle seance'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((values) => onSubmit(normalize(values)))} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Patient" error={errors.patient_id?.message}>
              <select className="input" {...register('patient_id')}>
                <option value={0}>Selectionner</option>
                {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.nom_complet}</option>)}
              </select>
            </Field>
            <Field label="Machine" error={errors.machine_id?.message}>
              <select className="input" {...register('machine_id')}>
                <option value={0}>Selectionner</option>
                {machines.map((machine) => <option key={machine.id} value={machine.id}>{machine.numero} - {machine.statut}</option>)}
              </select>
            </Field>
            <Field label="Infirmier">
              <select className="input" {...register('infirmier_id')}>
                <option value="">Non assigne</option>
                {infirmiers.map((infirmier) => <option key={infirmier.id} value={infirmier.id}>{infirmier.nom_complet}</option>)}
              </select>
            </Field>
            <Field label="Date" error={errors.date_seance?.message}><input type="date" className="input" {...register('date_seance')} /></Field>
            <Field label="Debut" error={errors.heure_debut?.message}><input type="time" className="input" {...register('heure_debut')} /></Field>
            <Field label="Fin" error={errors.heure_fin?.message}><input type="time" className="input" {...register('heure_fin')} /></Field>
            <Field label="Duree minutes"><input type="number" className="input" {...register('duree_minutes')} /></Field>
            <Field label="Statut"><select className="input" {...register('statut')}><option value="planifiee">Planifiee</option><option value="effectuee">Effectuee</option><option value="annulee">Annulee</option></select></Field>
          </div>

          <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            <Field label="Tension avant"><input className="input" placeholder="12/8" {...register('tension_avant')} /></Field>
            <Field label="Tension apres"><input className="input" placeholder="11/7" {...register('tension_apres')} /></Field>
            <Field label="Poids sec"><input type="number" step="0.01" className="input" {...register('poids_sec')} /></Field>
            <Field label="Poids avant"><input type="number" step="0.01" className="input" {...register('poids_avant')} /></Field>
            <Field label="Poids apres"><input type="number" step="0.01" className="input" {...register('poids_apres')} /></Field>
          </div>

          <Field label="Observations"><textarea className="input min-h-24" {...register('observations')} /></Field>

          <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-4">
            <div>
              {seance && onDelete && (
                <button type="button" onClick={onDelete} className="btn-danger">
                  Supprimer
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Annuler</button>
              <button type="submit" disabled={loading} className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function normalize(values: SeanceFormValues): SeancePayload {
  return {
    ...values,
    infirmier_id: values.infirmier_id || null,
    tension_avant: values.tension_avant || null,
    tension_apres: values.tension_apres || null,
    poids_avant: values.poids_avant || null,
    poids_apres: values.poids_apres || null,
    poids_sec: values.poids_sec || null,
    observations: values.observations || null,
  };
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
