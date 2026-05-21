import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { fetchMachines } from '../api/machines';
import { fetchNurses } from '../api/nurses';
import { fetchPatients } from '../api/patients';
import { createSeance, deleteSeance, fetchWeekSeances, updateSeance } from '../api/seances';
import { SeanceCalendar } from '../components/seances/SeanceCalendar';
import { SeanceForm } from '../components/seances/SeanceForm';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import type { Seance, SeancePayload } from '../types';

export function Seances() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [selected, setSelected] = useState<Seance | null>(null);
  const [initialSlot, setInitialSlot] = useState<{ date: string; start: string; end: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Seance | null>(null);

  const weekQuery = useQuery({ queryKey: ['seances', 'week', weekStart], queryFn: () => fetchWeekSeances(weekStart), staleTime: 2 * 60 * 1000 });
  const patientsQuery = useQuery({ queryKey: ['patients', 'active-list'], queryFn: () => fetchPatients({ statut: 'actif', per_page: 100 }), staleTime: 2 * 60 * 1000 });
  const machinesQuery = useQuery({ queryKey: ['machines'], queryFn: fetchMachines, staleTime: 2 * 60 * 1000 });
  const nursesQuery = useQuery({ queryKey: ['nurses', 'active-list'], queryFn: () => fetchNurses({ status: 'active', per_page: 100 }), staleTime: 2 * 60 * 1000 });

  const saveMutation = useMutation({
    mutationFn: (payload: SeancePayload) => (selected ? updateSeance(selected.id, payload) : createSeance(payload)),
    onSuccess: () => {
      toast.success(selected ? 'Seance modifiee' : 'Seance creee');
      setFormOpen(false);
      setSelected(null);
      setInitialSlot(null);
      queryClient.invalidateQueries({ queryKey: ['seances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (seance: Seance) => deleteSeance(seance.id),
    onSuccess: () => {
      toast.success('Seance supprimee');
      setDeleteTarget(null);
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['seances'] });
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white" onClick={() => setWeekStart(addDays(weekStart, -7))} title="Semaine precedente">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input type="date" className="input w-[180px]" value={weekStart} onChange={(event) => setWeekStart(startOfWeek(new Date(`${event.target.value}T00:00:00`)))} />
          <button type="button" className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white" onClick={() => setWeekStart(addDays(weekStart, 7))} title="Semaine suivante">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setSelected(null); setInitialSlot(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          Seance
        </button>
      </div>

      {weekQuery.isLoading ? (
        <div className="surface p-6 text-sm text-slate-500">Chargement du planning...</div>
      ) : (
        <SeanceCalendar
          startDate={weekStart}
          seances={weekQuery.data ?? []}
          onEdit={(seance) => { setSelected(seance); setInitialSlot(null); setFormOpen(true); }}
          onCreate={(date, start, end) => { setSelected(null); setInitialSlot({ date, start, end }); setFormOpen(true); }}
        />
      )}

      <SeanceForm
        open={formOpen}
        seance={selected}
        initialSlot={initialSlot}
        patients={patientsQuery.data?.data ?? []}
        machines={machinesQuery.data ?? []}
        nurses={nursesQuery.data?.data ?? []}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        onDelete={() => selected && setDeleteTarget(selected)}
        onClose={() => { setFormOpen(false); setSelected(null); setInitialSlot(null); }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer la seance"
        message={`La seance de ${deleteTarget?.patient?.nom_complet ?? ''} sera supprimee.`}
        confirmLabel="Supprimer"
        danger
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function startOfWeek(date: Date): string {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
