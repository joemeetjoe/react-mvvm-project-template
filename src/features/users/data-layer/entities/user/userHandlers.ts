import { HttpResponse, http } from 'msw';

import { userFixtures } from './userFixtures';

/**
 * Shared by the test server (`shared/testing/server`) and, from #10, the
 * dev-mode browser worker.
 */
export const userHandlers = [
  http.get('*/api/users', () => HttpResponse.json(userFixtures)),
  http.get('*/api/users/:id', ({ params }) => {
    const user = userFixtures.find((candidate) => candidate.id === params.id);

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),
];
