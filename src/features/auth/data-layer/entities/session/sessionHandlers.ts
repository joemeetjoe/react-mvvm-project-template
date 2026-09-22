import { HttpResponse, http } from 'msw';

import { sessionFixtures } from './sessionFixtures';

type LoginRequestBody = {
  email?: string;
  password?: string;
};

export const sessionHandlers = [
  http.post('*/api/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequestBody;
    const session = sessionFixtures.find((entry) => entry.user.email === body.email);

    if (!session) {
      return new HttpResponse(null, { status: 401, statusText: 'Invalid credentials' });
    }

    return HttpResponse.json(session);
  }),
];
