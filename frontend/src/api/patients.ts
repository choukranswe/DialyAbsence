import { apiClient, extractData } from './client';
import type { Absence, ApiResponse, PaginatedResponse, Patient, PatientPayload, PatientStats, Seance } from '../types';

export interface PatientFilters {
  search?: string;
  statut?: 'actif' | 'inactif' | 'tous';
  organisme?: string;
  per_page?: number;
  page?: number;
}

export interface PatientImportResult {
  created: number;
  errors: Array<{
    row: number;
    messages: string[];
  }>;
}

export async function fetchPatients(filters: PatientFilters = {}): Promise<PaginatedResponse<Patient>> {
  const response = await apiClient.get<PaginatedResponse<Patient>>('/patients', { params: filters });
  return response.data;
}

export async function fetchPatient(id: number): Promise<Patient> {
  const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
  return extractData(response);
}

export async function createPatient(payload: PatientPayload): Promise<Patient> {
  const response = await apiClient.post<ApiResponse<Patient>>('/patients', payload);
  return extractData(response);
}

export async function updatePatient(id: number, payload: PatientPayload): Promise<Patient> {
  const response = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, payload);
  return extractData(response);
}

export async function archivePatient(id: number): Promise<Patient> {
  const response = await apiClient.delete<ApiResponse<Patient>>(`/patients/${id}`);
  return extractData(response);
}

export async function importPatients(file: File): Promise<PatientImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<PatientImportResult>>('/patients/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return extractData(response);
}

export async function fetchPatientSeances(id: number): Promise<PaginatedResponse<Seance>> {
  const response = await apiClient.get<PaginatedResponse<Seance>>(`/patients/${id}/seances`, { params: { per_page: 10 } });
  return response.data;
}

export async function fetchPatientAbsences(id: number): Promise<PaginatedResponse<Absence>> {
  const response = await apiClient.get<PaginatedResponse<Absence>>(`/patients/${id}/absences`, { params: { per_page: 10 } });
  return response.data;
}

export async function fetchPatientStats(id: number): Promise<PatientStats> {
  const response = await apiClient.get<ApiResponse<PatientStats>>(`/patients/${id}/stats`);
  return extractData(response);
}
