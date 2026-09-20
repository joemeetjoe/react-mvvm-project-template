import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { clearLocalStorage, installMemoryLocalStorage } from './localStorage';
import { server } from './server';

installMemoryLocalStorage();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  clearLocalStorage();
});

afterAll(() => {
  server.close();
});
