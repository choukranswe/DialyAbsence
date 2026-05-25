import { Edit, Trash2, ClipboardX } from 'lucide-react';
import { absenceLabels, formatDate } from '../../lib/utils';
import type { Absence } from '../../types';
import { DataTable, type DataColumn } from '../shared/DataTable';
import { EmptyState } from '../shared/EmptyState';
import { StatusBadge } from '../shared/StatusBadge';

interface AbsenceTableProps {
  absences: Absence[];
  loading?: boolean;
  page: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (absence: Absence) => void;
  onDelete: (absence: Absence) => void;
  onCreate: () => void;
}

export function AbsenceTable({ absences, loading, page, lastPage, total, onPageChange, onEdit, onDelete, onCreate }: AbsenceTableProps) {
  const columns: DataColumn<Absence>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      sortValue: (absence) => absence.date_absence,
      render: (absence) => formatDate(absence.date_absence),
    },
    {
      key: 'patient',
      header: 'Patient',
      sortable: true,
      sortValue: (absence) => absence.patient?.nom_complet,
      render: (absence) => (
        <div>
          <div className="font-bold text-[#072C73]">{absence.patient?.nom_complet}</div>
          <div className="text-xs text-slate-500">{absence.patient?.cin}</div>
        </div>
      ),
    },
    { key: 'motif', header: 'Motif', render: (absence) => absenceLabels[absence.motif] },
    { key: 'justifiee', header: 'Justification', render: (absence) => <StatusBadge type="absence" value={absence.justifiee} /> },
    { key: 'declare', header: 'Declare par', render: (absence) => absence.declarant?.nom_complet ?? '-' },
    { key: 'notes', header: 'Notes', render: (absence) => <span className="line-clamp-2">{absence.notes ?? '-'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[110px]',
      render: (absence) => (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onEdit(absence)} className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-amber-50 hover:text-[#D97706]" title="Modifier">
            <Edit className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onDelete(absence)} className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-red-50 hover:text-[#DC2626]" title="Supprimer">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={absences}
      columns={columns}
      getRowKey={(absence) => absence.id}
      loading={loading}
      page={page}
      lastPage={lastPage}
      total={total}
      onPageChange={onPageChange}
      empty={<EmptyState icon={ClipboardX} title="Aucune absence" message="Aucune absence ne correspond aux filtres." actionLabel="Declarer une absence" onAction={onCreate} />}
    />
  );
}
