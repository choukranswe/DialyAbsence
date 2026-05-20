import { useAuthStore } from '../store/authStore';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    isAdmin: user?.role === 'admin',
    isMedecin: user?.role === 'medecin',
    isInfirmier: user?.role === 'infirmier',
    canManageUsers: user?.role === 'admin',
    canArchivePatients: user?.role === 'admin' || user?.role === 'medecin',
    canEditClinicalData: user?.role === 'admin' || user?.role === 'medecin' || user?.role === 'infirmier',
  };
}
