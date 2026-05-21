import { useAuthStore } from '../store/authStore';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    isAdmin: user?.role === 'admin',
    isMedecin: user?.role === 'doctor',
    isReceptionist: user?.role === 'receptionist',
    canManageUsers: user?.role === 'admin',
    canArchivePatients: user?.role === 'admin' || user?.role === 'doctor',
    canEditClinicalData: user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'receptionist',
  };
}
