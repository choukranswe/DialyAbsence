import { apiClient, extractData } from './client';
import type { ApiResponse, LeaveStatus, NurseLeave, NurseLeavePayload, PaginatedResponse } from '../types';

export interface NurseLeaveFilters {
  nurse_id?: number | '';
  from?: string;
  to?: string;
  status?: LeaveStatus | 'all' | '';
  per_page?: number;
  page?: number;
}

export async function fetchNurseLeaves(filters: NurseLeaveFilters = {}): Promise<PaginatedResponse<NurseLeave>> {
  const response = await apiClient.get<PaginatedResponse<NurseLeave>>('/nurse-leaves', { params: filters });
  return response.data;
}

export async function createNurseLeave(payload: NurseLeavePayload): Promise<NurseLeave> {
  const response = await apiClient.post<ApiResponse<NurseLeave>>('/nurse-leaves', payload);
  return extractData(response);
}

export async function updateNurseLeave(id: number, payload: NurseLeavePayload): Promise<NurseLeave> {
  const response = await apiClient.put<ApiResponse<NurseLeave>>(`/nurse-leaves/${id}`, payload);
  return extractData(response);
}

export async function approveNurseLeave(id: number): Promise<NurseLeave> {
  const response = await apiClient.post<ApiResponse<NurseLeave>>(`/nurse-leaves/${id}/approve`);
  return extractData(response);
}

export async function refuseNurseLeave(id: number): Promise<NurseLeave> {
  const response = await apiClient.post<ApiResponse<NurseLeave>>(`/nurse-leaves/${id}/refuse`);
  return extractData(response);
}
