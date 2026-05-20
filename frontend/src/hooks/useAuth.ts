import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchMe, login, logout } from '../api/auth';
import { useAuthStore } from '../store/authStore';

interface UseAuthOptions {
  fetchCurrentUser?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { fetchCurrentUser = true } = options;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token, setAuth, clearAuth } = useAuthStore();

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: fetchCurrentUser && Boolean(token),
    staleTime: 2 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      toast.success('Connexion reussie');
      navigate('/dashboard', { replace: true });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  return {
    user: user ?? meQuery.data ?? null,
    token,
    isAuthenticated: Boolean(token),
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,
    logout: logoutMutation.mutate,
    meQuery,
  };
}
