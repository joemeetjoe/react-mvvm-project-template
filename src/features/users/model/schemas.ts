import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user', 'manager', 'editor', 'viewer']),
  status: z.enum(['active', 'inactive', 'pending']),
  department: z.string().min(1, 'Department is required'),
  createdAt: z.string(),
  updatedAt: z.string(),
  avatar: z.string().optional(),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user', 'manager', 'editor', 'viewer']),
  status: z.enum(['active', 'inactive', 'pending']),
  department: z.string().min(1, 'Department is required'),
});

export type TUserUpdateForm = z.infer<typeof userUpdateSchema>;

export const UsersListResponseSchema = z.object({
  data: z.array(userSchema),
  pagination: z.object({
    pageIndex: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export const UserFilterOptionsSchema = z.object({
  role: z.array(z.object({ value: z.string(), label: z.string() })),
  status: z.array(z.object({ value: z.string(), label: z.string() })),
  department: z.array(z.object({ value: z.string(), label: z.string() })),
});
