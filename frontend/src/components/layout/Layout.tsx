import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className={cn('min-h-screen transition-all duration-200', collapsed ? 'pl-[76px]' : 'pl-[252px]')}>
        <Header />
        <main className="mx-auto w-full max-w-[1500px] px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
