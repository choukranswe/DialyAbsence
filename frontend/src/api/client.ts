import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

const fallbackApiUrl =
  typeof window === 'undefined'
    ? 'http://localhost:8000/api'
    : `${window.location.protocol}//${window.location.hostname}:8000/api`;

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || fallbackApiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }

    if (error.response?.status === 422) {
      const errors = error.response.data?.errors ?? {};
      const firstMessage = Object.values(errors).flat()[0] ?? error.response.data?.message ?? 'Validation echouee';
      toast.error(firstMessage);
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }

    return Promise.reject(error);
  },
);

export function extractData<T>(response: { data: { data: T } }): T {
  return response.data.data;
}
