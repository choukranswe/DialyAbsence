import { Archive, Edit, Eye, UserRound } from 'lucide-react';
import type { Patient } from '../../types';
import { DataTable, type DataColumn } from '../shared/DataTable';
import { EmptyState } from '../shared/EmptyState';
import { StatusBadge } from '../shared/StatusBadge';

interface PatientTableProps {
  patients: Patient[];
  loading?: boolean;
  page: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onArchive: (patient: Patient) => void;
  onCreate: () => void;
}

export function PatientTable({ patients, loading, page, lastPage, total, onPageChange, onView, onEdit, onArchive, onCreate }: PatientTableProps) {
  const columns: DataColumn<Patient>[] = [
    {
      key: 'patient',
      header: 'Patient',
      sortable: true,
      sortValue: (patient) => patient.nom_complet,
      render: (patient) => (
        <div>
          <div className="font-bold text-[#1E3A5F]">{patient.nom_complet}</div>
          <div className="text-xs text-slate-500">{patient.cin}</div>
        </div>
      ),
    },
    { key: 'telephone', header: 'Telephone', render: (patient) => patient.telephone },
    { key: 'ville', header: 'Ville', sortable: true, sortValue: (patient) => patient.ville, render: (patient) => patient.ville },
    { key: 'groupe', header: 'Groupe', render: (patient) => patient.groupe_sanguin },
    { key: 'age', header: 'Age', sortable: true, sortValue: (patient) => patient.age, render: (patient) => `${patient.age} ans` },
    { key: 'statut', header: 'Statut', render: (patient) => <StatusBadge type="patient" value={patient.actif} /> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[150px]',
      render: (patient) => (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onView(patient)} className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-blue-50 hover:text-[#2563EB]" title="Voir">
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onEdit(patient)} className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-amber-50 hover:text-[#D97706]" title="Modifier">
            <Edit className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onArchive(patient)} className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-red-50 hover:text-[#DC2626]" title="Archiver">
            <Archive className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={patients}
      columns={columns}
      getRowKey={(patient) => patient.id}
      loading={loading}
      page={page}
      lastPage={lastPage}
      total={total}
      onPageChange={onPageChange}
      empty={<EmptyState icon={UserRound} title="Aucun patient" message="Aucun dossier patient ne correspond aux filtres." actionLabel="Ajouter un patient" onAction={onCreate} />}
    />
  );
}
