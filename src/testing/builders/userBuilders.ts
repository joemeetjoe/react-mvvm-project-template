import type { User } from '@/features/users/model/types';

let idCounter = 0;

export const createUser = (overrides: Partial<User> = {}): User => {
  idCounter++;
  return {
    id: `user-${idCounter}`,
    firstName: `First${idCounter}`,
    lastName: `Last${idCounter}`,
    email: `user${idCounter}@example.com`,
    role: 'user',
    status: 'active',
    department: 'Engineering',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    avatar: undefined,
    ...overrides,
  };
};

export const createUsers = (count: number, overrides: Partial<User> = {}): User[] =>
  Array.from({ length: count }, () => createUser(overrides));

export const resetUserIdCounter = () => {
  idCounter = 0;
};
