import { LogOut, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const titles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/patients': 'Patients',
  '/seances': 'Seances',
  '/absences': 'Absences',
  '/nurses': 'Personnel infirmier',
  '/staff-leaves': 'Conges du personnel',
  '/machines': 'Machines',
  '/reports': 'Rapports',
  '/users': 'Utilisateurs',
};

export function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const title = titles[`/${location.pathname.split('/')[1]}`] ?? 'Centre de Dialyse';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div>
        <h1 className="text-xl font-bold text-[#1E3A5F]">{title}</h1>
        <p className="text-xs text-slate-500">{new Intl.DateTimeFormat('fr-MA', { dateStyle: 'full' }).format(new Date())}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 md:flex">
          <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
          <span>{user?.nom_complet}</span>
          <span className="rounded bg-white px-2 py-0.5 text-xs font-bold uppercase text-[#1E3A5F]">{user?.role}</span>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          title="Deconnexion"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
