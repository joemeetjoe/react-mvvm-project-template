import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { mockUsers } from '@/features/users/model/mocks/users';
import { mockFilterOptions } from '@/features/users/model/mocks/filterOptions';

const baseUrl = 'http://localhost:3000/api';

export const handlers = [
  http.get(`${baseUrl}/users`, () => {
    return HttpResponse.json({
      data: mockUsers,
      total: mockUsers.length,
      page: 1,
      pageSize: 10,
    });
  }),

  http.get(`${baseUrl}/users/:id`, ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.get(`${baseUrl}/users/filters`, () => {
    return HttpResponse.json(mockFilterOptions);
  }),

  http.put(`${baseUrl}/users/:id`, async ({ params, request }) => {
    const body = await request.json();
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ ...user, ...(body as Record<string, unknown>) });
  }),

  http.delete(`${baseUrl}/users/:id`, ({ params }) => {
    const user = mockUsers.find((u) => u.id === params.id);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ success: true });
  }),
];

export const server = setupServer(...handlers);
