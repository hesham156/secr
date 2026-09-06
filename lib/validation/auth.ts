import { z } from "zod";

export const emailSchema = z.string().trim().email().max(254).toLowerCase();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(12).max(256)
});

export const registerSchema = loginSchema;

export const masterPasswordSchema = z
  .string()
  .min(16, "Use at least 16 characters for the master password.")
  .max(256)
  .refine((value) => value.trim() === value, "Avoid leading or trailing spaces unless intentional.");
