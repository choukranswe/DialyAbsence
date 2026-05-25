import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  ClipboardX,
  FileText,
  Menu,
  MonitorCog,
  Umbrella,
  Users,
  UserRoundCog,
  UserRound,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePermissions } from '../../hooks/usePermissions';
import { centerBranding } from '../../lib/branding';

const links = [
  { to: '/dashboard', label: 'Tableau', icon: BarChart3 },
  { to: '/patients', label: 'Patients', icon: UserRound },
  { to: '/seances', label: 'Seances', icon: CalendarDays },
  { to: '/absences', label: 'Absences', icon: ClipboardX },
  { to: '/nurses', label: 'Personnel infirmier', icon: UserRoundCog },
  { to: '/staff-leaves', label: 'Conges du personnel', icon: Umbrella },
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
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-[#072C73] text-white transition-all duration-200',
        collapsed ? 'w-[76px]' : 'w-[252px]',
      )}
    >
      <div
        className={cn(
          'border-b border-white/10 px-3 py-4',
          collapsed ? 'flex h-20 items-center justify-center' : 'flex h-20 items-center gap-3',
        )}
      >
        {!collapsed && (
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <img className="h-12 w-12 shrink-0 object-contain" src={centerBranding.iconPath} alt="" aria-hidden="true" />
            <div className="flex h-12 min-w-0 flex-col justify-center">
              <div className="truncate text-xs font-semibold leading-4 text-blue-100">{centerBranding.nameLines[0]}</div>
              <div className="truncate text-base font-extrabold leading-5 text-white">{centerBranding.nameLines[1]}</div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/15 text-white transition hover:bg-white/10',
            collapsed ? 'mx-auto' : 'ml-auto',
          )}
          title="Basculer le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
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
                isActive ? 'bg-white text-[#072C73] shadow-sm' : 'text-blue-50 hover:bg-white/10',
                collapsed && 'justify-center px-0',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/10 px-4 py-4 text-xs text-blue-100">
          <div className="font-bold text-white">{centerBranding.name}</div>
          <div className="mt-1">Médecin {centerBranding.responsibleDoctor}</div>
          <div>{centerBranding.city}</div>
          <div>Version 1.0</div>
        </div>
      )}
    </aside>
  );
}
