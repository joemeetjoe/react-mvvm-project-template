import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { server } from '@/shared/testing/server';
import { useSessionStore } from '@/shared/stores/sessionStore';

import { HttpError, httpGet, httpPost } from './http';

const endpoint = 'https://example.test/api/probe';

afterEach(() => {
  useSessionStore.getState().clearSession();
});

describe('httpGet', () => {
  it('returns the parsed JSON body on success', async () => {
    server.use(http.get(endpoint, () => HttpResponse.json({ ok: true })));

    await expect(httpGet(endpoint)).resolves.toEqual({ ok: true });
  });

  it('attaches the session token as a bearer header when one is set', async () => {
    useSessionStore
      .getState()
      .setSession({ id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' }, 'test-token');

    server.use(
      http.get(endpoint, ({ request }) =>
        HttpResponse.json({ authorization: request.headers.get('authorization') }),
      ),
    );

    await expect(httpGet(endpoint)).resolves.toEqual({ authorization: 'Bearer test-token' });
  });

  it('sends no authorization header when there is no session', async () => {
    server.use(
      http.get(endpoint, ({ request }) =>
        HttpResponse.json({ authorization: request.headers.get('authorization') }),
      ),
    );

    await expect(httpGet(endpoint)).resolves.toEqual({ authorization: null });
  });

  it('throws an HttpError when the response is not ok', async () => {
    server.use(http.get(endpoint, () => new HttpResponse(null, { status: 500 })));

    await expect(httpGet(endpoint)).rejects.toThrow(HttpError);
    await expect(httpGet(endpoint)).rejects.toThrow(/500/);
  });

  it('clears the session when the response is a 401', async () => {
    useSessionStore
      .getState()
      .setSession({ id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' }, 'test-token');

    server.use(http.get(endpoint, () => new HttpResponse(null, { status: 401 })));

    await expect(httpGet(endpoint)).rejects.toThrow(HttpError);
    expect(useSessionStore.getState().token).toBeNull();
  });
});

describe('httpPost', () => {
  it('sends the body as JSON and returns the parsed response', async () => {
    server.use(http.post(endpoint, async ({ request }) => HttpResponse.json(await request.json())));

    await expect(httpPost(endpoint, { email: 'a@example.com' })).resolves.toEqual({
      email: 'a@example.com',
    });
  });

  it('throws an HttpError when the response is not ok', async () => {
    server.use(http.post(endpoint, () => new HttpResponse(null, { status: 400 })));

    await expect(httpPost(endpoint, {})).rejects.toThrow(HttpError);
  });

  it('clears the session when the response is a 401', async () => {
    useSessionStore
      .getState()
      .setSession({ id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' }, 'test-token');

    server.use(http.post(endpoint, () => new HttpResponse(null, { status: 401 })));

    await expect(httpPost(endpoint, {})).rejects.toThrow(HttpError);
    expect(useSessionStore.getState().token).toBeNull();
  });
});
