import { apiClient, extractData } from './client';
import type { ApiResponse, Nurse, NursePayload, PaginatedResponse } from '../types';

export interface NurseFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  per_page?: number;
  page?: number;
}

export async function fetchNurses(filters: NurseFilters = {}): Promise<PaginatedResponse<Nurse>> {
  const response = await apiClient.get<PaginatedResponse<Nurse>>('/nurses', { params: filters });
  return response.data;
}

export async function fetchNurse(id: number): Promise<Nurse> {
  const response = await apiClient.get<ApiResponse<Nurse>>(`/nurses/${id}`);
  return extractData(response);
}

export async function createNurse(payload: NursePayload): Promise<Nurse> {
  const response = await apiClient.post<ApiResponse<Nurse>>('/nurses', payload);
  return extractData(response);
}

export async function updateNurse(id: number, payload: NursePayload): Promise<Nurse> {
  const response = await apiClient.put<ApiResponse<Nurse>>(`/nurses/${id}`, payload);
  return extractData(response);
}

export async function archiveNurse(id: number): Promise<Nurse> {
  const response = await apiClient.delete<ApiResponse<Nurse>>(`/nurses/${id}`);
  return extractData(response);
}
