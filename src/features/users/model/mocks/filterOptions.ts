import type { UserFilterOptions } from '../types';
import { mockUsers } from './users';

function extractUnique(field: keyof typeof mockUsers[0]): { value: string; label: string }[] {
  const values = [...new Set(mockUsers.map((u) => String(u[field])))].sort();
  return values.map((v) => ({ value: v, label: v }));
}

export const mockFilterOptions: UserFilterOptions = {
  role: extractUnique('role'),
  status: extractUnique('status'),
  department: extractUnique('department'),
};
