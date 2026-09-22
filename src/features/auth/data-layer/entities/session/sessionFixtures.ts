import type { LoginCredentials, Session } from './sessionSchema';

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

/** What the login screen prefills while the API is mocked. */
export const demoLoginCredentials: LoginCredentials = {
  email: sessionFixtures[0].user.email,
  password: 'password',
};

export const demoLoginHint = `Mock API: sign in as ${sessionFixtures
  .map((session) => session.user.email)
  .join(' or ')} with any password.`;
