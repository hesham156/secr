"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { StoredVaultItem, VaultMetadata } from "./types";

const createVaultMetadataSchema = z.object({
  kdfSalt: z.string().min(16).max(128),
  kdfMemory: z.number().int().min(19_456).max(262_144),
  kdfIterations: z.number().int().min(2).max(10),
  kdfParallelism: z.number().int().min(1).max(4),
  encryptedVaultKey: z.string().min(20).max(5000)
});

const cipherString = z.string().min(1).max(20_000);

const encryptedItemSchema = z.object({
  itemType: z.enum(["credential", "note"]),
  favorite: z.boolean(),
  titleCipher: cipherString,
  usernameCipher: cipherString.nullable(),
  passwordCipher: cipherString.nullable(),
  websiteCipher: cipherString.nullable(),
  urlCipher: cipherString.nullable(),
  notesCipher: cipherString.nullable(),
  extraCipher: cipherString.nullable()
});

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; message: string };

async function currentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}

async function currentVault() {
  const user = await currentUser();
  if (!user) return { user: null, vault: null };
  const vault = await prisma.vault.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  return { user, vault };
}

export async function createVaultMetadata(input: z.infer<typeof createVaultMetadataSchema>): Promise<ActionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, message: "Authentication required." };

  const parsed = createVaultMetadataSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid vault metadata." };

  const existing = await prisma.vault.findFirst({ where: { userId: user.id } });
  if (existing) return { ok: false, message: "A vault already exists for this account." };

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
  return { ok: true, data: undefined };
}

export async function getVaultMetadata(): Promise<ActionResult<VaultMetadata | null>> {
  const { vault } = await currentVault();
  if (!vault) return { ok: true, data: null };
  if (!vault.encryptedVaultKey) return { ok: true, data: null };

  return {
    ok: true,
    data: {
      kdfSalt: vault.kdfSalt,
      kdfMemory: vault.kdfMemory,
      kdfIterations: vault.kdfIterations,
      kdfParallelism: vault.kdfParallelism,
      encryptedVaultKey: vault.encryptedVaultKey
    }
  };
}

export async function getVaultItems(): Promise<ActionResult<StoredVaultItem[]>> {
  const { vault } = await currentVault();
  if (!vault) return { ok: false, message: "Vault is not set up." };

  const items = await prisma.vaultItem.findMany({
    where: { vaultId: vault.id, deletedAt: null },
    orderBy: { updatedAt: "desc" }
  });

  return {
    ok: true,
    data: items.map((item) => ({
      id: item.id,
      itemType: item.itemType === "note" ? "note" : "credential",
      favorite: item.favorite,
      titleCipher: item.titleCipher,
      usernameCipher: item.usernameCipher,
      passwordCipher: item.passwordCipher,
      websiteCipher: item.websiteCipher,
      urlCipher: item.urlCipher,
      notesCipher: item.notesCipher,
      extraCipher: item.extraCipher,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))
  };
}

export async function createVaultItem(
  input: z.infer<typeof encryptedItemSchema>
): Promise<ActionResult<{ id: string }>> {
  const { user, vault } = await currentVault();
  if (!user || !vault) return { ok: false, message: "Vault is not set up." };

  const parsed = encryptedItemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid item payload." };

  const created = await prisma.vaultItem.create({
    data: {
      vaultId: vault.id,
      itemType: parsed.data.itemType,
      favorite: parsed.data.favorite,
      titleCipher: parsed.data.titleCipher,
      usernameCipher: parsed.data.usernameCipher,
      passwordCipher: parsed.data.passwordCipher,
      websiteCipher: parsed.data.websiteCipher,
      urlCipher: parsed.data.urlCipher,
      notesCipher: parsed.data.notesCipher,
      extraCipher: parsed.data.extraCipher
    }
  });

  await prisma.auditLog.create({ data: { userId: user.id, event: "PASSWORD_ADDED" } });
  return { ok: true, data: { id: created.id } };
}

export async function updateVaultItem(
  id: string,
  input: z.infer<typeof encryptedItemSchema>
): Promise<ActionResult> {
  const { user, vault } = await currentVault();
  if (!user || !vault) return { ok: false, message: "Vault is not set up." };

  const parsed = encryptedItemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid item payload." };

  const existing = await prisma.vaultItem.findFirst({ where: { id, vaultId: vault.id } });
  if (!existing) return { ok: false, message: "Item not found." };

  await prisma.vaultItem.update({
    where: { id },
    data: {
      itemType: parsed.data.itemType,
      favorite: parsed.data.favorite,
      titleCipher: parsed.data.titleCipher,
      usernameCipher: parsed.data.usernameCipher,
      passwordCipher: parsed.data.passwordCipher,
      websiteCipher: parsed.data.websiteCipher,
      urlCipher: parsed.data.urlCipher,
      notesCipher: parsed.data.notesCipher,
      extraCipher: parsed.data.extraCipher
    }
  });

  await prisma.auditLog.create({ data: { userId: user.id, event: "PASSWORD_UPDATED" } });
  return { ok: true, data: undefined };
}

export async function setFavorite(id: string, favorite: boolean): Promise<ActionResult> {
  const { vault } = await currentVault();
  if (!vault) return { ok: false, message: "Vault is not set up." };

  const existing = await prisma.vaultItem.findFirst({ where: { id, vaultId: vault.id } });
  if (!existing) return { ok: false, message: "Item not found." };

  await prisma.vaultItem.update({ where: { id }, data: { favorite } });
  return { ok: true, data: undefined };
}

export async function deleteVaultItem(id: string): Promise<ActionResult> {
  const { user, vault } = await currentVault();
  if (!user || !vault) return { ok: false, message: "Vault is not set up." };

  const existing = await prisma.vaultItem.findFirst({ where: { id, vaultId: vault.id } });
  if (!existing) return { ok: false, message: "Item not found." };

  await prisma.vaultItem.delete({ where: { id } });
  await prisma.auditLog.create({ data: { userId: user.id, event: "PASSWORD_DELETED" } });
  return { ok: true, data: undefined };
}
