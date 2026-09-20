import { HttpResponse, http } from 'msw';

import { userFixtures } from './userFixtures';

/**
 * Shared by the test server (`shared/testing/server`) and, from #10, the
 * dev-mode browser worker.
 */
export const userHandlers = [http.get('*/api/users', () => HttpResponse.json(userFixtures))];
