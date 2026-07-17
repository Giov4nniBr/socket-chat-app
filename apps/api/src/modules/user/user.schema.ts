import z, { email } from "zod";

export const registerSchema = z.object({
  name: z.string().max(22).min(2),
  email: z.email(),
  password: z.string().min(8).max(32),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(32),
});

export const searchSchema = z.object({
  email: z.email(),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type SearchDTO = z.infer<typeof searchSchema>;
