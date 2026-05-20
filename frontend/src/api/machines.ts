import { apiClient, extractData } from './client';
import type { ApiResponse, Machine, MachinePayload } from '../types';

export async function fetchMachines(): Promise<Machine[]> {
  const response = await apiClient.get<ApiResponse<Machine[]>>('/machines');
  return extractData(response);
}

export async function createMachine(payload: MachinePayload): Promise<Machine> {
  const response = await apiClient.post<ApiResponse<Machine>>('/machines', payload);
  return extractData(response);
}

export async function updateMachine(id: number, payload: MachinePayload): Promise<Machine> {
  const response = await apiClient.put<ApiResponse<Machine>>(`/machines/${id}`, payload);
  return extractData(response);
}
