import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { installBrowserStubs, resetBrowserStubs } from './browserStubs';
import { server } from './server';

installBrowserStubs();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetBrowserStubs();
});

afterAll(() => {
  server.close();
});
