import { z } from 'zod';

export const sessionUserRoles = ['admin', 'user'] as const;

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(sessionUserRoles),
});

export const sessionSchema = z.object({
  user: sessionUserSchema,
  token: z.string().min(1),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type SessionUserRole = SessionUser['role'];
export type Session = z.infer<typeof sessionSchema>;
