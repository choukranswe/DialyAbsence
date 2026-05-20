import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { createAbsence, deleteAbsence, fetchAbsences, updateAbsence } from '../api/absences';
import { fetchPatients } from '../api/patients';
import { downloadReport } from '../api/reports';
import { fetchSeances } from '../api/seances';
import { AbsenceForm } from '../components/absences/AbsenceForm';
import { AbsenceTable } from '../components/absences/AbsenceTable';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import type { Absence, AbsenceMotif, AbsencePayload } from '../types';

export function Absences() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ from: '', to: '', motif: '' as AbsenceMotif | '', justifiee: '' as boolean | '' });
  const [selected, setSelected] = useState<Absence | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Absence | null>(null);

  const absencesQuery = useQuery({
    queryKey: ['absences', filters, page],
    queryFn: () => fetchAbsences({ ...filters, page, per_page: 15 }),
    staleTime: 2 * 60 * 1000,
  });
  const patientsQuery = useQuery({ queryKey: ['patients', 'active-list'], queryFn: () => fetchPatients({ statut: 'actif', per_page: 100 }), staleTime: 2 * 60 * 1000 });
  const seancesQuery = useQuery({ queryKey: ['seances', 'absence-list'], queryFn: () => fetchSeances({ per_page: 100 }), staleTime: 2 * 60 * 1000 });

  const saveMutation = useMutation({
    mutationFn: (payload: AbsencePayload) => (selected ? updateAbsence(selected.id, payload) : createAbsence(payload)),
    onSuccess: () => {
      toast.success(selected ? 'Absence modifiee' : 'Absence declaree');
      setFormOpen(false);
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seances'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (absence: Absence) => deleteAbsence(absence.id),
    onSuccess: () => {
      toast.success('Absence supprimee');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['absences'] });
    },
  });

  const exportQuery = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '') exportQuery.set(key, String(value));
  });

  const data = absencesQuery.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid flex-1 gap-3 md:grid-cols-4">
          <label>
            <span className="label">Du</span>
            <input type="date" className="input mt-1" value={filters.from} onChange={(event) => { setFilters({ ...filters, from: event.target.value }); setPage(1); }} />
          </label>
          <label>
            <span className="label">Au</span>
            <input type="date" className="input mt-1" value={filters.to} onChange={(event) => { setFilters({ ...filters, to: event.target.value }); setPage(1); }} />
          </label>
          <label>
            <span className="label">Motif</span>
            <select className="input mt-1" value={filters.motif} onChange={(event) => { setFilters({ ...filters, motif: event.target.value as AbsenceMotif | '' }); setPage(1); }}>
              <option value="">Tous</option>
              <option value="medical">Medical</option>
              <option value="personnel">Personnel</option>
              <option value="hospitalise">Hospitalise</option>
              <option value="autre">Autre</option>
            </select>
          </label>
          <label>
            <span className="label">Justification</span>
            <select className="input mt-1" value={String(filters.justifiee)} onChange={(event) => { setFilters({ ...filters, justifiee: event.target.value === '' ? '' : event.target.value === 'true' }); setPage(1); }}>
              <option value="">Toutes</option>
              <option value="true">Justifiees</option>
              <option value="false">Non justifiees</option>
            </select>
          </label>
        </div>

        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => downloadReport(`/absences/export?${exportQuery.toString()}`, 'absences.xlsx').catch((error) => toast.error(error.message))}>
            <Download className="h-4 w-4" />
            Excel
          </button>
          <button type="button" className="btn-primary" onClick={() => { setSelected(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Absence
          </button>
        </div>
      </div>

      <AbsenceTable
        absences={data?.data ?? []}
        loading={absencesQuery.isLoading}
        page={data?.meta.current_page ?? 1}
        lastPage={data?.meta.last_page ?? 1}
        total={data?.meta.total ?? 0}
        onPageChange={setPage}
        onEdit={(absence) => { setSelected(absence); setFormOpen(true); }}
        onDelete={setDeleteTarget}
        onCreate={() => { setSelected(null); setFormOpen(true); }}
      />

      <AbsenceForm
        open={formOpen}
        absence={selected}
        patients={patientsQuery.data?.data ?? []}
        seances={seancesQuery.data?.data ?? []}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        onClose={() => { setFormOpen(false); setSelected(null); }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer absence"
        message={`L'absence de ${deleteTarget?.patient?.nom_complet ?? ''} sera supprimee.`}
        confirmLabel="Supprimer"
        danger
        onConfirm={() => deleteTarget && removeMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
