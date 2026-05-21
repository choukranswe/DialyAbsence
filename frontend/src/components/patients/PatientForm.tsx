import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { organismeOptions } from '../../lib/utils';
import type { Machine, Patient, PatientPayload, User } from '../../types';

const schema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prenom est requis'),
  cin: z.string().regex(/^[A-Z]{1,2}[0-9]+$/i, 'CIN invalide'),
  date_naissance: z.string().min(1, 'La date de naissance est requise'),
  sexe: z.enum(['M', 'F']),
  telephone: z.string().regex(/^(05|06|07)[0-9]{8}$/, 'Telephone marocain invalide'),
  emergency_contact: z.string().optional().nullable(),
  adresse: z.string().min(1, 'Adresse requise'),
  ville: z.string().min(1, 'Ville requise'),
  groupe_sanguin: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  poids: z.coerce.number().min(1),
  taille: z.coerce.number().int().min(30),
  cause_insuffisance_renale: z.string().min(1, 'Cause requise'),
  nephrologue_id: z.coerce.number().optional().nullable(),
  date_entree: z.string().min(1, "Date d'entree requise"),
  actif: z.boolean(),
  notes: z.string().optional().nullable(),
  organisme: z.string().optional().nullable(),
  insurance_number: z.string().optional().nullable(),
  dialysis_group: z.string().optional().nullable(),
  assigned_machine_id: z.coerce.number().optional().nullable(),
  coverage_type: z.string().optional().nullable(),
  coverage_expiration: z.string().optional().nullable(),
});

type PatientFormInput = z.input<typeof schema>;
type PatientFormValues = z.output<typeof schema>;

interface PatientFormProps {
  open: boolean;
  patient?: Patient | null;
  doctors?: User[];
  machines?: Machine[];
  loading?: boolean;
  onSubmit: (payload: PatientPayload) => void;
  onClose: () => void;
}

const defaults: PatientFormValues = {
  nom: '',
  prenom: '',
  cin: '',
  date_naissance: '',
  sexe: 'M',
  telephone: '',
  emergency_contact: '',
  adresse: '',
  ville: 'Casablanca',
  groupe_sanguin: 'O+',
  poids: 70,
  taille: 170,
  cause_insuffisance_renale: '',
  nephrologue_id: null,
  date_entree: new Date().toISOString().slice(0, 10),
  actif: true,
  notes: '',
  organisme: '',
  insurance_number: '',
  dialysis_group: null,
  assigned_machine_id: null,
  coverage_type: '',
  coverage_expiration: '',
};

export function PatientForm({ open, patient, doctors = [], machines = [], loading, onSubmit, onClose }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormInput, unknown, PatientFormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (patient) {
      reset({
        nom: patient.nom,
        prenom: patient.prenom,
        cin: patient.cin,
        date_naissance: patient.date_naissance,
        sexe: patient.sexe,
        telephone: patient.telephone,
        emergency_contact: patient.emergency_contact ?? '',
        adresse: patient.adresse,
        ville: patient.ville,
        groupe_sanguin: patient.groupe_sanguin,
        poids: Number(patient.poids),
        taille: patient.taille,
        cause_insuffisance_renale: patient.cause_insuffisance_renale,
        nephrologue_id: patient.nephrologue_id ?? null,
        date_entree: patient.date_entree,
        actif: patient.actif,
        notes: patient.notes ?? '',
        organisme: patient.organisme ?? '',
        insurance_number: patient.insurance_number ?? '',
        dialysis_group: patient.dialysis_group ?? null,
        assigned_machine_id: patient.assigned_machine_id ?? null,
        coverage_type: patient.coverage_type ?? '',
        coverage_expiration: patient.coverage_expiration ?? '',
      });
    } else {
      reset(defaults);
    }
  }, [patient, reset, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8">
      <div role="dialog" aria-modal="true" className="mx-auto w-full max-w-5xl rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#1E3A5F]">{patient ? 'Modifier patient' : 'Nouveau patient'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((values) => onSubmit({
          ...values,
          nephrologue_id: values.nephrologue_id || null,
          emergency_contact: values.emergency_contact || null,
          notes: values.notes || null,
          organisme: values.organisme || null,
          insurance_number: values.insurance_number || null,
          dialysis_group: values.dialysis_group || null,
          assigned_machine_id: values.assigned_machine_id || null,
          coverage_type: values.coverage_type || null,
          coverage_expiration: values.coverage_expiration || null,
        }))} className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Nom" error={errors.nom?.message}><input className="input" {...register('nom')} /></Field>
            <Field label="Prenom" error={errors.prenom?.message}><input className="input" {...register('prenom')} /></Field>
            <Field label="CIN" error={errors.cin?.message}><input className="input uppercase" {...register('cin')} /></Field>
            <Field label="Telephone" error={errors.telephone?.message}><input className="input" {...register('telephone')} /></Field>
            <Field label="Contact urgence"><input className="input" {...register('emergency_contact')} /></Field>
            <Field label="Date naissance" error={errors.date_naissance?.message}><input type="date" className="input" {...register('date_naissance')} /></Field>
            <Field label="Sexe"><select className="input" {...register('sexe')}><option value="M">M</option><option value="F">F</option></select></Field>
            <Field label="Groupe"><select className="input" {...register('groupe_sanguin')}>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((value) => <option key={value}>{value}</option>)}</select></Field>
            <Field label="Date entree" error={errors.date_entree?.message}><input type="date" className="input" {...register('date_entree')} /></Field>
            <Field label="Poids kg" error={errors.poids?.message}><input type="number" step="0.01" className="input" {...register('poids')} /></Field>
            <Field label="Taille cm" error={errors.taille?.message}><input type="number" className="input" {...register('taille')} /></Field>
            <Field label="Ville" error={errors.ville?.message}><input className="input" {...register('ville')} /></Field>
            <Field label="Nephrologue">
              <select className="input" {...register('nephrologue_id')}>
                <option value="">Non assigne</option>
                {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.nom_complet}</option>)}
              </select>
            </Field>
            <Field label="Organisme">
              <select className="input" {...register('organisme')}>
                <option value="">Non renseigne</option>
                {organismeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Numero assurance" error={errors.insurance_number?.message}><input className="input" {...register('insurance_number')} /></Field>
            <Field label="Groupe dialyse">
              <select className="input" {...register('dialysis_group')}>
                <option value="">Non assigne</option>
                <option value="L/M/V">L/M/V</option>
                <option value="M/J/S">M/J/S</option>
              </select>
            </Field>
            <Field label="Machine assignee">
              <select className="input" {...register('assigned_machine_id')}>
                <option value="">Non assignee</option>
                {machines.map((machine) => <option key={machine.id} value={machine.id}>{machine.numero} - {machine.statut}</option>)}
              </select>
            </Field>
            <Field label="Type couverture" error={errors.coverage_type?.message}><input className="input" {...register('coverage_type')} /></Field>
            <Field label="Expiration couverture" error={errors.coverage_expiration?.message}><input type="date" className="input" {...register('coverage_expiration')} /></Field>
          </div>

          <Field label="Adresse" error={errors.adresse?.message}><input className="input" {...register('adresse')} /></Field>
          <Field label="Cause insuffisance renale" error={errors.cause_insuffisance_renale?.message}><textarea className="input min-h-24" {...register('cause_insuffisance_renale')} /></Field>
          <Field label="Notes"><textarea className="input min-h-20" {...register('notes')} /></Field>

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('actif')} />
            Patient actif
          </label>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={loading} className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
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
