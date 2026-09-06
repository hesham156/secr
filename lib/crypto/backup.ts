"use client";

import { type CipherEnvelope, encryptText } from "./client-encryption";

export type KeyVaultBackup = {
  format: "keyvault.backup";
  version: 1;
  exportedAt: string;
  payload: CipherEnvelope;
};

export async function createEncryptedBackup(vaultKey: CryptoKey, data: unknown): Promise<KeyVaultBackup> {
  const payload = await encryptText(vaultKey, JSON.stringify(data), "keyvault:v1:backup");
  return {
    format: "keyvault.backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    payload
  };
}
