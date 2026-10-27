// Admin API client. Set VITE_API_URL (e.g. https://api.919.ae) to talk to the backend;
// without it the admin runs on the mock data in ./mock.ts and every action resolves locally.
import { availability, companies, hires, metrics, recruiters, reports, seekers, vacancies } from './mock';

export const API_URL: string | undefined = import.meta.env.VITE_API_URL || undefined;
const TOKEN_KEY = '919admin.token';

function token() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...init?.headers },
  });
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed: ${res.status}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export type Entity = 'seekers' | 'companies' | 'recruiters' | 'vacancies' | 'reports';
export type AdminAction =
  | 'approve'
  | 'reject'
  | 'request-changes'
  | 'hide'
  | 'show'
  | 'block'
  | 'unblock'
  | 'delete'
  | 'pause'
  | 'resume'
  | 'close'
  | 'urgent'
  | 'take'
  | 'resolve'
  | 'dismiss'
  | 'warn'
  | 'edit'
  | 'approve-licence'
  | 'reject-licence'
  | 'avail-off';

export const api = {
  /** Initial snapshot for the admin. One call keeps the mock and real modes interchangeable. */
  async bootstrap() {
    if (!API_URL) return { seekers, companies, recruiters, vacancies, reports, hires, availability, metrics };
    return request<{
      seekers: typeof seekers;
      companies: typeof companies;
      recruiters: typeof recruiters;
      vacancies: typeof vacancies;
      reports: typeof reports;
      hires: typeof hires;
      availability: typeof availability;
      metrics: typeof metrics;
    }>('/admin/bootstrap');
  },
  /** POST /admin/:entity/:id/:action with an optional { reason, note, patch } body. */
  async act(entity: Entity, id: string, action: AdminAction, body?: Record<string, unknown>) {
    if (!API_URL) return;
    if (action === 'delete') return request<void>(`/admin/${entity}/${id}`, { method: 'DELETE', body: JSON.stringify(body ?? {}) });
    return request<void>(`/admin/${entity}/${id}/${action}`, { method: 'POST', body: JSON.stringify(body ?? {}) });
  },
};
