import { apiClient, extractData } from './client';
import type { ApiResponse, PaginatedResponse, Seance, SeancePayload, SeanceStatut } from '../types';

export interface SeanceFilters {
  date?: string;
  patient_id?: number;
  machine_id?: number;
  statut?: SeanceStatut | '';
  per_page?: number;
  page?: number;
}

export async function fetchSeances(filters: SeanceFilters = {}): Promise<PaginatedResponse<Seance>> {
  const response = await apiClient.get<PaginatedResponse<Seance>>('/seances', { params: filters });
  return response.data;
}

export async function fetchTodaySeances(): Promise<Seance[]> {
  const response = await apiClient.get<ApiResponse<Seance[]>>('/seances/today');
  return extractData(response);
}

export async function fetchWeekSeances(startDate?: string): Promise<Seance[]> {
  const response = await apiClient.get<ApiResponse<Seance[]>>('/seances/week', { params: { start_date: startDate } });
  return extractData(response);
}

export async function createSeance(payload: SeancePayload): Promise<Seance> {
  const response = await apiClient.post<ApiResponse<Seance>>('/seances', payload);
  return extractData(response);
}

export async function updateSeance(id: number, payload: SeancePayload): Promise<Seance> {
  const response = await apiClient.put<ApiResponse<Seance>>(`/seances/${id}`, payload);
  return extractData(response);
}

export async function deleteSeance(id: number): Promise<void> {
  await apiClient.delete(`/seances/${id}`);
}
