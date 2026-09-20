import type { User } from './userSchema';

export const userFixtures: User[] = [
  {
    id: 'USR-001',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada.lovelace@example.com',
    role: 'admin',
    status: 'active',
    department: 'Engineering',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-11-20T14:30:00Z',
  },
  {
    id: 'USR-002',
    firstName: 'Grace',
    lastName: 'Hopper',
    email: 'grace.hopper@example.com',
    role: 'manager',
    status: 'active',
    department: 'Operations',
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-10-05T11:45:00Z',
  },
  {
    id: 'USR-003',
    firstName: 'Alan',
    lastName: 'Turing',
    email: 'alan.turing@example.com',
    role: 'editor',
    status: 'inactive',
    department: 'Research',
    createdAt: '2024-03-05T10:30:00Z',
    updatedAt: '2024-09-15T16:00:00Z',
  },
];
