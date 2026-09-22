import { useSessionStore } from '@/shared/stores/sessionStore';

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`Request failed with status ${status} ${statusText}`.trim());
    this.name = 'HttpError';
    this.status = status;
  }
}

const buildHeaders = (extra?: Record<string, string>): HeadersInit => {
  const { token } = useSessionStore.getState();

  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const handleResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 401) {
    useSessionStore.getState().clearSession();
  }

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return (await response.json()) as unknown;
};

export const httpGet = async (path: string): Promise<unknown> => {
  const response = await fetch(path, { headers: buildHeaders() });

  return handleResponse(response);
};

export const httpPost = async (path: string, body: unknown): Promise<unknown> => {
  const response = await fetch(path, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};

export const httpPatch = async (path: string, body: unknown): Promise<unknown> => {
  const response = await fetch(path, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};
