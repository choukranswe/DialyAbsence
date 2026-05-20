import { apiClient } from './client';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('dialyse-auth-storage');
  try {
    const parsed = token ? JSON.parse(token) : null;
    const bearer = parsed?.state?.token;
    return bearer ? { Authorization: `Bearer ${bearer}` } : {};
  } catch {
    return {};
  }
}

export async function downloadReport(path: string, filename: string): Promise<void> {
  const response = await fetch(`${apiClient.defaults.baseURL}${path}`, {
    headers: {
      Accept: 'application/octet-stream',
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Telechargement impossible');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function periodQuery(month: number, year: number): string {
  return `month=${month}&year=${year}`;
}
