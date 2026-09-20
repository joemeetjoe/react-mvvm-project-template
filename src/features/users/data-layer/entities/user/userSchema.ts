import { z } from 'zod';

export const userRoles = ['admin', 'user', 'manager', 'editor', 'viewer'] as const;
export const userStatuses = ['active', 'inactive', 'pending'] as const;

export const userSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(userRoles),
  status: z.enum(userStatuses),
  department: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const userListSchema = z.array(userSchema);

export type User = z.infer<typeof userSchema>;
export type UserRole = User['role'];
export type UserStatus = User['status'];
