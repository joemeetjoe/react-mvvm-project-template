import type { Session } from './sessionSchema';

/** Any password is accepted for one of these emails; anything else is rejected. */
export const sessionFixtures: Session[] = [
  {
    user: { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin' },
    token: 'test-admin-token',
  },
  {
    user: { id: '2', email: 'user@example.com', name: 'Regular User', role: 'user' },
    token: 'test-user-token',
  },
];
