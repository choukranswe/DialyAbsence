import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Edit, Plus, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { approveNurseLeave, createNurseLeave, fetchNurseLeaves, refuseNurseLeave, updateNurseLeave } from '../api/nurseLeaves';
import { fetchNurses } from '../api/nurses';
import { DataTable, type DataColumn } from '../components/shared/DataTable';
import { EmptyState } from '../components/shared/EmptyState';
import { StatusBadge } from '../components/shared/StatusBadge';
import { formatDate, leaveStatusLabels, leaveTypeLabels, todayIso } from '../lib/utils';
import type { LeaveStatus, Nurse, NurseLeave, NurseLeavePayload } from '../types';

const schema = z.object({
  nurse_id: z.coerce.number().min(1, 'Infirmier requis'),
  start_date: z.string().min(1, 'Date debut requise'),
  end_date: z.string().min(1, 'Date fin requise'),
  leave_type: z.enum(['annual_leave', 'sick_leave', 'exceptional_leave', 'vacation', 'rest_day']),
  reason: z.string().optional().nullable(),
  status: z.enum(['pending', 'approved', 'refused', 'cancelled']),
  notes: z.string().optional().nullable(),
});

type LeaveValues = z.infer<typeof schema>;

const defaults: LeaveValues = {
  nurse_id: 0,
  start_date: todayIso(),
  end_date: todayIso(),
  leave_type: 'annual_leave',
  reason: '',
  status: 'pending',
  notes: '',
};

export function StaffLeaves() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ nurse_id: '' as number | '', from: '', to: '', status: 'all' as LeaveStatus | 'all' });
  const [selected, setSelected] = useState<NurseLeave | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(todayIso().slice(0, 7));

  const nursesQuery = useQuery({ queryKey: ['nurses', 'active-list'], queryFn: () => fetchNurses({ status: 'active', per_page: 100 }), staleTime: 2 * 60 * 1000 });
  const leavesQuery = useQuery({
    queryKey: ['nurse-leaves', filters],
    queryFn: () => fetchNurseLeaves({ ...filters, per_page: 100 }),
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: NurseLeavePayload) => (selected ? updateNurseLeave(selected.id, payload) : createNurseLeave(payload)),
    onSuccess: () => {
      toast.success(selected ? 'Conge modifie' : 'Demande de conge creee');
      setFormOpen(false);
      setSelected(null);
      invalidate(queryClient);
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveNurseLeave,
    onSuccess: () => {
      toast.success('Conge approuve');
      invalidate(queryClient);
    },
  });

  const refuseMutation = useMutation({
    mutationFn: refuseNurseLeave,
    onSuccess: () => {
      toast.success('Conge refuse');
      invalidate(queryClient);
    },
  });

  const leaves = leavesQuery.data?.data ?? [];
  const nurses = nursesQuery.data?.data ?? [];

  const columns: DataColumn<NurseLeave>[] = [
    {
      key: 'nurse',
      header: 'Infirmier',
      sortable: true,
      sortValue: (leave) => leave.nurse?.full_name ?? '',
      render: (leave) => (
        <div>
          <div className="font-bold text-[#1E3A5F]">{leave.nurse?.full_name ?? '-'}</div>
          <div className="text-xs text-slate-500">{leave.nurse?.shift ?? '-'}</div>
        </div>
      ),
    },
    { key: 'period', header: 'Periode', sortable: true, sortValue: (leave) => leave.start_date, render: (leave) => `${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}` },
    { key: 'type', header: 'Type', render: (leave) => leaveTypeLabels[leave.leave_type] },
    { key: 'status', header: 'Statut', render: (leave) => <StatusBadge type="leave" value={leave.status} /> },
    { key: 'approver', header: 'Decision', render: (leave) => leave.approver?.nom_complet ?? '-' },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[170px]',
      render: (leave) => (
        <div className="flex items-center gap-1">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-amber-50 hover:text-[#D97706]" onClick={() => { setSelected(leave); setFormOpen(true); }} title="Modifier">
            <Edit className="h-4 w-4" />
          </button>
          {leave.status === 'pending' && (
            <>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-green-50 hover:text-[#16A34A]" onClick={() => approveMutation.mutate(leave.id)} title="Approuver">
                <Check className="h-4 w-4" />
              </button>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-red-50 hover:text-[#DC2626]" onClick={() => refuseMutation.mutate(leave.id)} title="Refuser">
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <section className="surface p-5">
        <div className="grid gap-3 md:grid-cols-[1.3fr_180px_180px_180px_auto]">
          <label>
            <span className="label">Infirmier</span>
            <select className="input mt-1" value={filters.nurse_id} onChange={(event) => setFilters({ ...filters, nurse_id: event.target.value ? Number(event.target.value) : '' })}>
              <option value="">Tous</option>
              {nurses.map((nurse) => <option key={nurse.id} value={nurse.id}>{nurse.full_name}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Du</span>
            <input type="date" className="input mt-1" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
          </label>
          <label>
            <span className="label">Au</span>
            <input type="date" className="input mt-1" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
          </label>
          <label>
            <span className="label">Statut</span>
            <select className="input mt-1" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as LeaveStatus | 'all' })}>
              <option value="all">Tous</option>
              {Object.entries(leaveStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button type="button" className="btn-primary w-full" onClick={() => { setSelected(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" />
              Conge
            </button>
          </div>
        </div>
      </section>

      <LeaveCalendar month={calendarMonth} leaves={leaves} onMonthChange={setCalendarMonth} />

      <DataTable
        data={leaves}
        columns={columns}
        getRowKey={(leave) => leave.id}
        loading={leavesQuery.isLoading}
        empty={<EmptyState icon={Search} title="Aucun conge" message="Aucune demande ne correspond aux filtres." actionLabel="Creer une demande" onAction={() => { setSelected(null); setFormOpen(true); }} />}
      />

      <LeaveDialog
        open={formOpen}
        leave={selected}
        nurses={nurses}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        onClose={() => { setFormOpen(false); setSelected(null); }}
      />
    </div>
  );
}

function LeaveCalendar({ month, leaves, onMonthChange }: { month: string; leaves: NurseLeave[]; onMonthChange: (month: string) => void }) {
  const days = useMemo(() => monthDays(month), [month]);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2 font-bold text-[#1E3A5F]">
          <CalendarDays className="h-5 w-5" />
          Calendrier des conges
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200" onClick={() => onMonthChange(addMonths(month, -1))} title="Mois precedent">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input type="month" className="input w-[150px]" value={month} onChange={(event) => onMonthChange(event.target.value)} />
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200" onClick={() => onMonthChange(addMonths(month, 1))} title="Mois suivant">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 bg-slate-50 text-xs font-bold uppercase text-slate-500">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => <div key={day} className="border-r border-slate-200 px-3 py-2 last:border-r-0">{day}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayLeaves = leaves.filter((leave) => day.iso && leave.start_date <= day.iso && leave.end_date >= day.iso);
          return (
            <div key={day.key} className="min-h-28 border-r border-t border-slate-100 p-2 last:border-r-0">
              {day.iso && <div className="text-xs font-bold text-slate-500">{Number(day.iso.slice(-2))}</div>}
              <div className="mt-2 space-y-1">
                {dayLeaves.slice(0, 3).map((leave) => (
                  <div key={leave.id} className="truncate rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-[#1E3A5F]" title={leave.nurse?.full_name}>
                    {leave.nurse?.full_name}
                  </div>
                ))}
                {dayLeaves.length > 3 && <div className="text-xs font-bold text-slate-500">+{dayLeaves.length - 3}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LeaveDialog({ open, leave, nurses, loading, onSubmit, onClose }: { open: boolean; leave: NurseLeave | null; nurses: Nurse[]; loading?: boolean; onSubmit: (payload: NurseLeavePayload) => void; onClose: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    reset(leave ? toPayload(leave) : defaults);
  }, [leave, open, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8">
      <div role="dialog" aria-modal="true" className="mx-auto w-full max-w-3xl rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#1E3A5F]">{leave ? 'Modifier conge' : 'Nouvelle demande de conge'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="space-y-5 p-6" onSubmit={handleSubmit((values) => onSubmit(cleanPayload(values)))}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Infirmier" error={errors.nurse_id?.message}>
              <select className="input" {...register('nurse_id')}>
                <option value={0}>Selectionner</option>
                {nurses.map((nurse) => <option key={nurse.id} value={nurse.id}>{nurse.full_name}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select className="input" {...register('leave_type')}>
                {Object.entries(leaveTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Date debut" error={errors.start_date?.message}><input type="date" className="input" {...register('start_date')} /></Field>
            <Field label="Date fin" error={errors.end_date?.message}><input type="date" className="input" {...register('end_date')} /></Field>
            <Field label="Statut">
              <select className="input" {...register('status')}>
                {Object.entries(leaveStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Motif"><textarea className="input min-h-20" {...register('reason')} /></Field>
          <Field label="Notes"><textarea className="input min-h-20" {...register('notes')} /></Field>
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

function toPayload(leave: NurseLeave): LeaveValues {
  return {
    nurse_id: leave.nurse_id,
    start_date: leave.start_date,
    end_date: leave.end_date,
    leave_type: leave.leave_type,
    reason: leave.reason ?? '',
    status: leave.status,
    notes: leave.notes ?? '',
  };
}

function cleanPayload(values: LeaveValues): NurseLeavePayload {
  return {
    ...values,
    reason: values.reason || null,
    notes: values.notes || null,
  };
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['nurse-leaves'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

function monthDays(month: string) {
  const first = new Date(`${month}-01T00:00:00`);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    return {
      key: `${month}-${index}`,
      iso: iso.startsWith(month) ? iso : '',
    };
  });
}

function addMonths(month: string, offset: number): string {
  const date = new Date(`${month}-01T00:00:00`);
  date.setMonth(date.getMonth() + offset);
  return date.toISOString().slice(0, 7);
}
