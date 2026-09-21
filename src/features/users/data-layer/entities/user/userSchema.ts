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

// The options a filter form can offer (issue #6). Departments are the
// distinct values seen in the data rather than a fixed enum, so they come
// from the server rather than being hardcoded here.
export const userFilterOptionsSchema = z.object({
  roles: z.array(z.enum(userRoles)),
  statuses: z.array(z.enum(userStatuses)),
  departments: z.array(z.string()),
});
export type UserFilterOptions = z.infer<typeof userFilterOptionsSchema>;

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
