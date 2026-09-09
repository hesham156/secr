import { decryptText, encryptText, type CipherEnvelope } from "./client-encryption";
import type { EncryptedItemPayload, StoredVaultItem, VaultItemView } from "@/lib/vault/types";
import type { VaultItemInput } from "@/lib/validation/vault";

// Additional-authenticated-data tags bind each ciphertext to its field so a
// tampered server cannot swap one encrypted field for another.
const AAD = {
  title: "keyvault:v1:item:title",
  username: "keyvault:v1:item:username",
  password: "keyvault:v1:item:password",
  website: "keyvault:v1:item:website",
  url: "keyvault:v1:item:url",
  notes: "keyvault:v1:item:notes",
  extra: "keyvault:v1:item:extra"
} as const;

async function seal(key: CryptoKey, value: string, aad: string): Promise<string> {
  const envelope = await encryptText(key, value, aad);
  return JSON.stringify(envelope);
}

async function sealOptional(key: CryptoKey, value: string | undefined, aad: string): Promise<string | null> {
  if (!value) return null;
  return seal(key, value, aad);
}

async function open(key: CryptoKey, cipher: string | null): Promise<string> {
  if (!cipher) return "";
  const envelope = JSON.parse(cipher) as CipherEnvelope;
  return decryptText(key, envelope);
}

export async function encryptItem(key: CryptoKey, input: VaultItemInput): Promise<EncryptedItemPayload> {
  const extra = JSON.stringify({ category: input.category ?? "", tags: input.tags ?? [] });
  const itemType = input.password ? "credential" : "note";

  return {
    itemType,
    favorite: Boolean(input.favorite),
    titleCipher: await seal(key, input.title, AAD.title),
    usernameCipher: await sealOptional(key, input.username, AAD.username),
    passwordCipher: await sealOptional(key, input.password, AAD.password),
    websiteCipher: await sealOptional(key, input.website, AAD.website),
    urlCipher: await sealOptional(key, input.url, AAD.url),
    notesCipher: await sealOptional(key, input.notes, AAD.notes),
    extraCipher: await seal(key, extra, AAD.extra)
  };
}

export async function decryptItem(key: CryptoKey, stored: StoredVaultItem): Promise<VaultItemView> {
  let category = "";
  let tags: string[] = [];
  if (stored.extraCipher) {
    try {
      const parsed = JSON.parse(await open(key, stored.extraCipher)) as { category?: string; tags?: string[] };
      category = parsed.category ?? "";
      tags = Array.isArray(parsed.tags) ? parsed.tags : [];
    } catch {
      // Ignore malformed extra payloads; treat as empty metadata.
    }
  }

  return {
    id: stored.id,
    itemType: stored.itemType,
    favorite: stored.favorite,
    title: await open(key, stored.titleCipher),
    username: await open(key, stored.usernameCipher),
    password: await open(key, stored.passwordCipher),
    website: await open(key, stored.websiteCipher),
    url: await open(key, stored.urlCipher),
    notes: await open(key, stored.notesCipher),
    category,
    tags,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt
  };
}
