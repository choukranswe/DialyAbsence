import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchMachines } from '../api/machines';
import { archivePatient, createPatient, fetchPatients, importPatients, updatePatient } from '../api/patients';
import { fetchUsers } from '../api/users';
import { PatientForm } from '../components/patients/PatientForm';
import { PatientImportDialog } from '../components/patients/PatientImportDialog';
import { PatientTable } from '../components/patients/PatientTable';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { usePermissions } from '../hooks/usePermissions';
import type { Patient, PatientPayload } from '../types';

export function Patients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = usePermissions();
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState<'actif' | 'inactif' | 'tous'>('actif');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Patient | null>(null);

  const patientsQuery = useQuery({
    queryKey: ['patients', { search, statut, page }],
    queryFn: () => fetchPatients({ search, statut, page, per_page: 15 }),
    staleTime: 2 * 60 * 1000,
  });

  const doctorsQuery = useQuery({
    queryKey: ['users', 'doctors'],
    queryFn: () => fetchUsers({ role: 'doctor', per_page: 100 }),
    enabled: isAdmin,
    staleTime: 2 * 60 * 1000,
  });
  const machinesQuery = useQuery({ queryKey: ['machines'], queryFn: fetchMachines, staleTime: 2 * 60 * 1000 });

  const saveMutation = useMutation({
    mutationFn: (payload: PatientPayload) => (selected ? updatePatient(selected.id, payload) : createPatient(payload)),
    onSuccess: () => {
      toast.success(selected ? 'Patient modifie' : 'Patient cree');
      setFormOpen(false);
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (patient: Patient) => archivePatient(patient.id),
    onSuccess: () => {
      toast.success('Patient archive');
      setArchiveTarget(null);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const importMutation = useMutation({
    mutationFn: importPatients,
    onSuccess: (result) => {
      toast.success(`${result.created} patient(s) importe(s)`);

      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} ligne(s) ignoree(s). Verifiez le fichier source.`);
      }

      setImportOpen(false);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const data = patientsQuery.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Nom, prenom ou CIN"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <select className="input w-[170px]" value={statut} onChange={(event) => { setStatut(event.target.value as typeof statut); setPage(1); }}>
            <option value="actif">Actifs</option>
            <option value="inactif">Archives</option>
            <option value="tous">Tous</option>
          </select>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Import Excel
          </button>
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => { setSelected(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Patient
          </button>
        </div>
      </div>

      <PatientTable
        patients={data?.data ?? []}
        loading={patientsQuery.isLoading}
        page={data?.meta.current_page ?? 1}
        lastPage={data?.meta.last_page ?? 1}
        total={data?.meta.total ?? 0}
        onPageChange={setPage}
        onView={(patient) => navigate(`/patients/${patient.id}`)}
        onEdit={(patient) => { setSelected(patient); setFormOpen(true); }}
        onArchive={setArchiveTarget}
        onCreate={() => { setSelected(null); setFormOpen(true); }}
      />

      <PatientForm
        open={formOpen}
        patient={selected}
        doctors={doctorsQuery.data?.data ?? []}
        machines={machinesQuery.data ?? []}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        onClose={() => { setFormOpen(false); setSelected(null); }}
      />

      <PatientImportDialog
        open={importOpen}
        loading={importMutation.isPending}
        onImport={(file) => importMutation.mutate(file)}
        onClose={() => setImportOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title="Archiver le patient"
        message={`Le dossier ${archiveTarget?.nom_complet ?? ''} passera en statut archive.`}
        confirmLabel="Archiver"
        danger
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget)}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
