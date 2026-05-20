import { apiClient, extractData } from './client';
import type { ApiResponse, PaginatedResponse, Role, User, UserPayload } from '../types';

export interface UserFilters {
  search?: string;
  role?: Role | '';
  per_page?: number;
  page?: number;
}

export async function fetchUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get<PaginatedResponse<User>>('/users', { params: filters });
  return response.data;
}

export async function createUser(payload: UserPayload): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>('/users', payload);
  return extractData(response);
}

export async function updateUser(id: number, payload: UserPayload): Promise<User> {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, payload);
  return extractData(response);
}
