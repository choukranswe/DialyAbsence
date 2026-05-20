import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { LoadingSkeleton } from './LoadingSkeleton';

export interface DataColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | boolean | null | undefined;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  getRowKey: (row: T) => string | number;
  loading?: boolean;
  empty?: ReactNode;
  page?: number;
  lastPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

type Direction = 'asc' | 'desc';

export function DataTable<T>({ data, columns, getRowKey, loading, empty, page, lastPage, total, onPageChange }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const column = columns.find((item) => item.key === sortKey);
    if (!column?.sortValue) return data;

    return [...data].sort((a, b) => {
      const av = column.sortValue?.(a);
      const bv = column.sortValue?.(b);
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return direction === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
  }, [columns, data, direction, sortKey]);

  if (loading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (data.length === 0) {
    return <>{empty}</>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => {
                const active = sortKey === column.key;
                const Icon = !active ? ChevronsUpDown : direction === 'asc' ? ChevronUp : ChevronDown;
                return (
                  <th key={column.key} className={cn('px-4 py-3 text-left text-xs font-bold uppercase text-slate-500', column.className)}>
                    {column.sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1"
                        onClick={() => {
                          if (active) {
                            setDirection(direction === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortKey(column.key);
                            setDirection('asc');
                          }
                        }}
                      >
                        {column.header}
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <tr key={getRowKey(row)} className="border-t border-slate-100 transition hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-3 text-sm text-slate-700', column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {page && lastPage && onPageChange && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <span>{total ?? data.length} resultats</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              title="Page precedente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-[#1E3A5F]">
              {page} / {lastPage}
            </span>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
              className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              title="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
