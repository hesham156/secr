import { z } from "zod";

export const urlSchema = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .refine((value) => {
    if (!value) return true;
    try {
      const normalized = value.includes("://") ? value : `https://${value}`;
      const url = new URL(normalized);
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  }, "Enter a valid http or https URL.");

export const vaultItemInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  website: z.string().trim().max(160).optional(),
  url: urlSchema,
  username: z.string().trim().max(254).optional(),
  password: z.string().max(512).optional(),
  notes: z.string().max(5000).optional(),
  category: z.string().trim().max(80).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  favorite: z.boolean().default(false),
  extra: z.record(z.string(), z.string().max(2000)).optional()
});

export type VaultItemInput = z.infer<typeof vaultItemInputSchema>;
