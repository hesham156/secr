// Shared vault item shapes.
//
// - VaultItemView is the decrypted, in-memory representation. It exists only in
//   the browser after the vault is unlocked and is never sent to the server.
// - EncryptedItemPayload is what crosses the network and is stored at rest. Every
//   sensitive field is a JSON-serialized AES-GCM CipherEnvelope string.

export type VaultItemType = "credential" | "note";

export type VaultItemView = {
  id: string;
  itemType: VaultItemType;
  favorite: boolean;
  title: string;
  website: string;
  url: string;
  username: string;
  password: string;
  notes: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type EncryptedItemPayload = {
  itemType: VaultItemType;
  favorite: boolean;
  titleCipher: string;
  usernameCipher: string | null;
  passwordCipher: string | null;
  websiteCipher: string | null;
  urlCipher: string | null;
  notesCipher: string | null;
  extraCipher: string | null;
};

export type StoredVaultItem = EncryptedItemPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type VaultMetadata = {
  kdfSalt: string;
  kdfMemory: number;
  kdfIterations: number;
  kdfParallelism: number;
  encryptedVaultKey: string;
};
