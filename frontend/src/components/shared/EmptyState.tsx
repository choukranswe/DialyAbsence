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
      <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-[#2F7ED8]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#072C73]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="mt-5 rounded-md bg-[#0A4FAF] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#072C73]">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
