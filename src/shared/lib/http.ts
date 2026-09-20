/**
 * The single network boundary for the app. Every data-layer `api` module goes
 * through it, so MSW only ever has one kind of request to intercept.
 */

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`Request failed with status ${status} ${statusText}`.trim());
    this.name = 'HttpError';
    this.status = status;
  }
}

export const httpGet = async (path: string): Promise<unknown> => {
  const response = await fetch(path, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return (await response.json()) as unknown;
};
