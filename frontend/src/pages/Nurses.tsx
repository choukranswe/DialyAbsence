import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Edit, Eye, Plus, Search, UserRound, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { archiveNurse, createNurse, fetchNurses, updateNurse } from '../api/nurses';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { DataTable, type DataColumn } from '../components/shared/DataTable';
import { EmptyState } from '../components/shared/EmptyState';
import { StatusBadge } from '../components/shared/StatusBadge';
import { nurseStatusLabels } from '../lib/utils';
import type { Nurse, NursePayload } from '../types';

const schema = z.object({
  full_name: z.string().min(1, 'Nom complet requis'),
  phone: z.string().optional().nullable(),
  shift: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']),
  notes: z.string().optional().nullable(),
});

type NurseValues = z.infer<typeof schema>;

const defaults: NurseValues = {
  full_name: '',
  phone: '',
  shift: 'Matin',
  status: 'active',
  notes: '',
};

export function Nurses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'all'>('active');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Nurse | null>(null);
  const [details, setDetails] = useState<Nurse | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Nurse | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const nursesQuery = useQuery({
    queryKey: ['nurses', { search, status, page }],
    queryFn: () => fetchNurses({ search, status, page, per_page: 15 }),
    staleTime: 2 * 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: NursePayload) => (selected ? updateNurse(selected.id, payload) : createNurse(payload)),
    onSuccess: () => {
      toast.success(selected ? 'Infirmier modifie' : 'Infirmier ajoute');
      setFormOpen(false);
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (nurse: Nurse) => archiveNurse(nurse.id),
    onSuccess: () => {
      toast.success('Infirmier archive');
      setArchiveTarget(null);
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const columns: DataColumn<Nurse>[] = [
    {
      key: 'full_name',
      header: 'Infirmier',
      sortable: true,
      sortValue: (nurse) => nurse.full_name,
      render: (nurse) => (
        <div>
          <div className="font-bold text-[#072C73]">{nurse.full_name}</div>
          <div className="text-xs text-slate-500">{nurse.phone ?? '-'}</div>
        </div>
      ),
    },
    { key: 'shift', header: 'Shift', sortable: true, sortValue: (nurse) => nurse.shift ?? '', render: (nurse) => nurse.shift ?? '-' },
    { key: 'leaves', header: 'Conges', render: (nurse) => nurse.leaves_count ?? 0 },
    { key: 'status', header: 'Statut', render: (nurse) => <StatusBadge type="nurse" value={nurse.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[150px]',
      render: (nurse) => (
        <div className="flex items-center gap-1">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-blue-50 hover:text-[#0A4FAF]" onClick={() => setDetails(nurse)} title="Voir">
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-amber-50 hover:text-[#D97706]" onClick={() => { setSelected(nurse); setFormOpen(true); }} title="Modifier">
            <Edit className="h-4 w-4" />
          </button>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-red-50 hover:text-[#DC2626]" onClick={() => setArchiveTarget(nurse)} title="Archiver">
            <Archive className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const data = nursesQuery.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input pl-9" placeholder="Nom, telephone ou shift" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          </div>
          <select className="input w-[170px]" value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }}>
            <option value="active">Actifs</option>
            <option value="inactive">Archives</option>
            <option value="all">Tous</option>
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setSelected(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          Infirmier
        </button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        getRowKey={(nurse) => nurse.id}
        loading={nursesQuery.isLoading}
        page={data?.meta.current_page ?? 1}
        lastPage={data?.meta.last_page ?? 1}
        total={data?.meta.total ?? 0}
        onPageChange={setPage}
        empty={<EmptyState icon={UserRound} title="Aucun infirmier" message="Aucun membre du personnel infirmier ne correspond aux filtres." actionLabel="Ajouter un infirmier" onAction={() => { setSelected(null); setFormOpen(true); }} />}
      />

      <NurseDialog
        open={formOpen}
        nurse={selected}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        onClose={() => { setFormOpen(false); setSelected(null); }}
      />

      <NurseDetails nurse={details} onClose={() => setDetails(null)} />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title="Archiver infirmier"
        message={`${archiveTarget?.full_name ?? ''} passera en statut inactif.`}
        confirmLabel="Archiver"
        danger
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget)}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}

function NurseDialog({ open, nurse, loading, onSubmit, onClose }: { open: boolean; nurse: Nurse | null; loading?: boolean; onSubmit: (payload: NursePayload) => void; onClose: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NurseValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    reset(nurse ? toPayload(nurse) : defaults);
  }, [nurse, open, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#072C73]">{nurse ? 'Modifier infirmier' : 'Nouvel infirmier'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="space-y-5 p-6" onSubmit={handleSubmit((values) => onSubmit(cleanPayload(values)))}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom complet" error={errors.full_name?.message}><input className="input" {...register('full_name')} /></Field>
            <Field label="Telephone" error={errors.phone?.message}><input className="input" {...register('phone')} /></Field>
            <Field label="Shift"><input className="input" {...register('shift')} /></Field>
            <Field label="Statut"><select className="input" {...register('status')}><option value="active">Actif</option><option value="inactive">Inactif</option></select></Field>
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

function NurseDetails({ nurse, onClose }: { nurse: Nurse | null; onClose: () => void }) {
  if (!nurse) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#072C73]">{nurse.full_name}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4 p-6 text-sm md:grid-cols-2">
          <Detail label="Telephone" value={nurse.phone ?? '-'} />
          <Detail label="Shift" value={nurse.shift ?? '-'} />
          <Detail label="Statut" value={nurseStatusLabels[nurse.status]} />
          <Detail label="Conges" value={String(nurse.leaves_count ?? 0)} />
          <div className="md:col-span-2">
            <Detail label="Notes" value={nurse.notes ?? '-'} />
          </div>
        </div>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function toPayload(nurse: Nurse): NurseValues {
  return {
    full_name: nurse.full_name,
    phone: nurse.phone ?? '',
    shift: nurse.shift ?? '',
    status: nurse.status,
    notes: nurse.notes ?? '',
  };
}

function cleanPayload(values: NurseValues): NursePayload {
  return {
    ...values,
    phone: values.phone || null,
    shift: values.shift || null,
    notes: values.notes || null,
  };
}
