import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Wrench, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createMachine, fetchMachines, updateMachine } from '../api/machines';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatDate, todayIso } from '../lib/utils';
import type { Machine, MachinePayload } from '../types';

const schema = z.object({
  numero: z.string().min(1, 'Numero requis'),
  marque: z.string().min(1, 'Marque requise'),
  modele: z.string().min(1, 'Modele requis'),
  statut: z.enum(['disponible', 'en_utilisation', 'maintenance', 'hors_service']),
  date_installation: z.string().optional().nullable(),
  date_derniere_maintenance: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type MachineValues = z.infer<typeof schema>;

const defaults: MachineValues = {
  numero: '',
  marque: 'Fresenius',
  modele: '4008S',
  statut: 'disponible',
  date_installation: '',
  date_derniere_maintenance: '',
  notes: '',
};

export function Machines() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Machine | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const machinesQuery = useQuery({ queryKey: ['machines'], queryFn: fetchMachines, staleTime: 2 * 60 * 1000 });

  const saveMutation = useMutation({
    mutationFn: (payload: MachinePayload) => (selected ? updateMachine(selected.id, payload) : createMachine(payload)),
    onSuccess: () => {
      toast.success(selected ? 'Machine modifiee' : 'Machine creee');
      setFormOpen(false);
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['machines'] });
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: (machine: Machine) => updateMachine(machine.id, { ...cleanPayload(toPayload(machine)), statut: 'maintenance', date_derniere_maintenance: todayIso() }),
    onSuccess: () => {
      toast.success('Maintenance enregistree');
      queryClient.invalidateQueries({ queryKey: ['machines'] });
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <button type="button" className="btn-primary" onClick={() => { setSelected(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          Machine
        </button>
      </div>

      {machinesQuery.isLoading ? (
        <div className="surface p-6 text-sm text-slate-500">Chargement des machines...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(machinesQuery.data ?? []).map((machine) => (
            <section key={machine.id} className="surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#1E3A5F]">{machine.numero}</h2>
                  <p className="text-sm text-slate-500">{machine.marque} {machine.modele}</p>
                </div>
                <StatusBadge type="machine" value={machine.statut} />
              </div>
              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <div>Installation: {formatDate(machine.date_installation)}</div>
                <div>Maintenance: {formatDate(machine.date_derniere_maintenance)}</div>
              </div>
              <div className="mt-5 flex gap-2">
                <button type="button" className="btn-secondary flex-1" onClick={() => { setSelected(machine); setFormOpen(true); }}>
                  <Edit className="h-4 w-4" />
                  Modifier
                </button>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-md border border-amber-200 text-[#D97706] hover:bg-amber-50" onClick={() => maintenanceMutation.mutate(machine)} title="Maintenance">
                  <Wrench className="h-4 w-4" />
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      <MachineDialog
        open={formOpen}
        machine={selected}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        onClose={() => { setFormOpen(false); setSelected(null); }}
      />
    </div>
  );
}

function MachineDialog({ open, machine, loading, onSubmit, onClose }: { open: boolean; machine: Machine | null; loading?: boolean; onSubmit: (payload: MachinePayload) => void; onClose: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MachineValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    reset(machine ? toPayload(machine) : defaults);
  }, [machine, open, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#1E3A5F]">{machine ? 'Modifier machine' : 'Nouvelle machine'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="space-y-5 p-6" onSubmit={handleSubmit((values) => onSubmit(cleanPayload(values)))}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Numero" error={errors.numero?.message}><input className="input" {...register('numero')} /></Field>
            <Field label="Statut"><select className="input" {...register('statut')}><option value="disponible">Disponible</option><option value="en_utilisation">En utilisation</option><option value="maintenance">Maintenance</option><option value="hors_service">Hors service</option></select></Field>
            <Field label="Marque" error={errors.marque?.message}><input className="input" {...register('marque')} /></Field>
            <Field label="Modele" error={errors.modele?.message}><input className="input" {...register('modele')} /></Field>
            <Field label="Installation"><input type="date" className="input" {...register('date_installation')} /></Field>
            <Field label="Derniere maintenance"><input type="date" className="input" {...register('date_derniere_maintenance')} /></Field>
          </div>
          <Field label="Notes"><textarea className="input min-h-24" {...register('notes')} /></Field>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
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

function toPayload(machine: Machine): MachinePayload {
  return {
    numero: machine.numero,
    marque: machine.marque,
    modele: machine.modele,
    statut: machine.statut,
    date_installation: machine.date_installation ?? '',
    date_derniere_maintenance: machine.date_derniere_maintenance ?? '',
    notes: machine.notes ?? '',
  };
}

function cleanPayload(values: MachineValues): MachinePayload {
  return {
    ...values,
    date_installation: values.date_installation || null,
    date_derniere_maintenance: values.date_derniere_maintenance || null,
    notes: values.notes || null,
  };
}
