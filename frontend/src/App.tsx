import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/layout/Layout';
import { useAuthStore } from './store/authStore';
import { Absences } from './pages/Absences';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Machines } from './pages/Machines';
import { Nurses } from './pages/Nurses';
import { PatientDetail } from './pages/PatientDetail';
import { Patients } from './pages/Patients';
import { Reports } from './pages/Reports';
import { Seances } from './pages/Seances';
import { StaffLeaves } from './pages/StaffLeaves';
import { Users } from './pages/Users';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Page><Dashboard /></Page>} />
          <Route path="/patients" element={<Page><Patients /></Page>} />
          <Route path="/patients/:id" element={<Page><PatientDetail /></Page>} />
          <Route path="/seances" element={<Page><Seances /></Page>} />
          <Route path="/absences" element={<Page><Absences /></Page>} />
          <Route path="/nurses" element={<Page><Nurses /></Page>} />
          <Route path="/staff-leaves" element={<Page><StaffLeaves /></Page>} />
          <Route path="/machines" element={<Page><Machines /></Page>} />
          <Route path="/reports" element={<Page><Reports /></Page>} />
          <Route path="/users" element={<AdminRoute><Page><Users /></Page></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
      {children}
    </motion.div>
  );
}
