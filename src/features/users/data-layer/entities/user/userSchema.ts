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

export const userListResponseSchema = z.object({
  users: userListSchema,
  total: z.number().int().nonnegative(),
});

export type User = z.infer<typeof userSchema>;
export type UserRole = User['role'];
export type UserStatus = User['status'];
export type UserListResponse = z.infer<typeof userListResponseSchema>;

// The columns the users list can be sorted by (issue #5).
export const userSortFields = ['firstName', 'email', 'department', 'role', 'status'] as const;
export type UserSortField = (typeof userSortFields)[number];
export type SortDirection = 'asc' | 'desc';

export const userUpdateSchema = userSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  status: true,
  department: true,
});

export type UserUpdate = z.infer<typeof userUpdateSchema>;
