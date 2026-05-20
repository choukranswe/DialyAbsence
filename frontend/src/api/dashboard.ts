import { apiClient, extractData } from './client';
import type { AlertPatient, ApiResponse, DashboardStats, WeeklyAttendance } from '../types';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  return extractData(response);
}

export async function fetchWeeklyAttendance(): Promise<WeeklyAttendance[]> {
  const response = await apiClient.get<ApiResponse<WeeklyAttendance[]>>('/dashboard/weekly-attendance');
  return extractData(response);
}

export async function fetchAlerts(): Promise<AlertPatient[]> {
  const response = await apiClient.get<ApiResponse<AlertPatient[]>>('/dashboard/alerts');
  return extractData(response);
}
