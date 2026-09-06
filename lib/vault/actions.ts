"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createVaultMetadataSchema = z.object({
  kdfSalt: z.string().min(16).max(128),
  kdfMemory: z.number().int().min(19_456).max(262_144),
  kdfIterations: z.number().int().min(2).max(10),
  kdfParallelism: z.number().int().min(1).max(4),
  encryptedVaultKey: z.string().min(20).max(5000)
});

export async function createVaultMetadata(input: z.infer<typeof createVaultMetadataSchema>) {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, message: "Authentication required." };
  }

  const parsed = createVaultMetadataSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid vault metadata." };
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { ok: false, message: "Authentication required." };

  await prisma.vault.create({
    data: {
      userId: user.id,
      kdfSalt: parsed.data.kdfSalt,
      kdfMemory: parsed.data.kdfMemory,
      kdfIterations: parsed.data.kdfIterations,
      kdfParallelism: parsed.data.kdfParallelism,
      encryptedVaultKey: parsed.data.encryptedVaultKey
    }
  });

  await prisma.auditLog.create({ data: { userId: user.id, event: "VAULT_CREATED" } });
  return { ok: true };
}
