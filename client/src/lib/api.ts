const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === 'object' && body && 'error' in body ? JSON.stringify((body as any).error) : String(body);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return body as T;
}

export function login(email: string, password: string) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signup(email: string, password: string, name: string) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export function logout(token?: string) {
  return apiFetch('/auth/logout', { method: 'POST' }, token);
}

export function me(token?: string) {
  return apiFetch('/auth/me', {}, token);
}

export function bootstrap(token?: string) {
  return apiFetch('/bootstrap', {}, token);
}

export function listProjects(token?: string) {
  return apiFetch('/projects', {}, token);
}

export function listTools(projectId: string, token?: string) {
  return apiFetch(`/projects/${projectId}/tools`, {}, token);
}

export function listProductionServices(projectId: string, token?: string) {
  return apiFetch(`/projects/${projectId}/production-services`, {}, token);
}

export function listActivity(projectId: string, token?: string) {
  return apiFetch(`/projects/${projectId}/activity`, {}, token);
}

export function createJson<T = Json>(path: string, payload: Json, token?: string) {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(payload) }, token);
}

export { API_BASE_URL, apiFetch };
