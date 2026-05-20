import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  ClipboardX,
  FileText,
  Menu,
  MonitorCog,
  Users,
  UserRound,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePermissions } from '../../hooks/usePermissions';

const links = [
  { to: '/dashboard', label: 'Tableau', icon: BarChart3 },
  { to: '/patients', label: 'Patients', icon: UserRound },
  { to: '/seances', label: 'Seances', icon: CalendarDays },
  { to: '/absences', label: 'Absences', icon: ClipboardX },
  { to: '/machines', label: 'Machines', icon: MonitorCog },
  { to: '/reports', label: 'Rapports', icon: FileText },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { isAdmin } = usePermissions();
  const allLinks = isAdmin ? [...links, { to: '/users', label: 'Utilisateurs', icon: Users }] : links;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-[#1E3A5F] text-white transition-all duration-200',
        collapsed ? 'w-[76px]' : 'w-[252px]',
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <button
          type="button"
          onClick={onToggle}
          className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-white transition hover:bg-white/10"
          title="Basculer le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">Centre de Dialyse</div>
            <div className="truncate text-xs text-blue-100">Gestion clinique</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {allLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition',
                isActive ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-blue-50 hover:bg-white/10',
                collapsed && 'justify-center px-0',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
