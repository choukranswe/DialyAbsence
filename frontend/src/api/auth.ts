import { apiClient, extractData } from './client';
import type { ApiResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}
//php artisan serve --host=0.0.0.0 --port=8000
export interface LoginResult {
  token: string;
  user: User;
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await apiClient.post<ApiResponse<LoginResult>>('/auth/login', payload);
  return extractData(response);
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function fetchMe(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return extractData(response);
}
