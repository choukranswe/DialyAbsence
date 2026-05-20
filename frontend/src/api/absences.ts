import { apiClient, extractData } from './client';
import type { Absence, AbsenceMotif, AbsencePayload, ApiResponse, PaginatedResponse } from '../types';

export interface AbsenceFilters {
  patient_id?: number;
  from?: string;
  to?: string;
  motif?: AbsenceMotif | '';
  justifiee?: boolean | '';
  per_page?: number;
  page?: number;
}

export async function fetchAbsences(filters: AbsenceFilters = {}): Promise<PaginatedResponse<Absence>> {
  const response = await apiClient.get<PaginatedResponse<Absence>>('/absences', { params: filters });
  return response.data;
}

export async function createAbsence(payload: AbsencePayload): Promise<Absence> {
  const response = await apiClient.post<ApiResponse<Absence>>('/absences', payload);
  return extractData(response);
}

export async function updateAbsence(id: number, payload: AbsencePayload): Promise<Absence> {
  const response = await apiClient.put<ApiResponse<Absence>>(`/absences/${id}`, payload);
  return extractData(response);
}

export async function deleteAbsence(id: number): Promise<void> {
  await apiClient.delete(`/absences/${id}`);
}

export function absenceExportUrl(filters: AbsenceFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return `${apiClient.defaults.baseURL}/absences/export?${params.toString()}`;
}
