import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmer', danger = false, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-[#DC2626]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#072C73]">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{message}</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-end gap-2 p-5">
          <button type="button" onClick={onCancel} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={danger ? 'rounded-md bg-[#DC2626] px-4 py-2 text-sm font-bold text-white hover:bg-red-700' : 'rounded-md bg-[#0A4FAF] px-4 py-2 text-sm font-bold text-white hover:bg-[#072C73]'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
