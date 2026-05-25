import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { centerBranding } from '../../lib/branding';
import { cn } from '../../lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className={cn('min-h-screen transition-all duration-200', collapsed ? 'pl-[76px]' : 'pl-[252px]')}>
        <Header sidebarCollapsed={collapsed} />
        <main className="mx-auto w-full max-w-[1500px] px-6 py-6">
          <Outlet />
        </main>
        <footer className="mx-auto flex w-full max-w-[1500px] flex-wrap gap-x-4 gap-y-1 px-6 pb-6 text-xs text-slate-500">
          <span className="font-bold text-[#072C73]">{centerBranding.name}</span>
          <span>Médecin responsable: {centerBranding.responsibleDoctor}</span>
          <span>Ville: {centerBranding.city}</span>
        </footer>
      </div>
    </div>
  );
}
