import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-[#2563EB]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#1E3A5F]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="mt-5 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
