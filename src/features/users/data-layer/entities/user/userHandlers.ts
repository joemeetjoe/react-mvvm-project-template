import { HttpResponse, http } from 'msw';

import type { User } from './userSchema';
import { userFixtures } from './userFixtures';

/**
 * A mutable copy of the fixtures backing the detail/update handlers, so a
 * successful edit is visible to the GET that runs after cache invalidation —
 * mirroring a real backend. The list handler intentionally keeps reading the
 * frozen `userFixtures` (out of scope for #8).
 */
let userStore: User[] = userFixtures.map((user) => ({ ...user }));

const findStoredUser = (id: string): User | undefined =>
  userStore.find((candidate) => candidate.id === id);

/**
 * Shared by the test server (`shared/testing/server`) and, from #10, the
 * dev-mode browser worker.
 */
export const userHandlers = [
  http.get('*/api/users', () => HttpResponse.json(userFixtures)),
  http.get('*/api/users/:id', ({ params }) => {
    const user = findStoredUser(params.id as string);

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(user);
  }),
  http.patch('*/api/users/:id', async ({ params, request }) => {
    const user = findStoredUser(params.id as string);

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    const update = (await request.json()) as Partial<User>;
    const updated: User = { ...user, ...update, updatedAt: new Date().toISOString() };

    userStore = userStore.map((candidate) => (candidate.id === updated.id ? updated : candidate));

    return HttpResponse.json(updated);
  }),
];
