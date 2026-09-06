"use client";

import { argon2idAsync } from "@noble/hashes/argon2.js";
import { base64UrlToBytes, bytesToArrayBuffer, bytesToBase64Url, bytesToUtf8, utf8ToBytes } from "./encoding";

export type KdfParams = {
  salt: string;
  memory: number;
  iterations: number;
  parallelism: number;
};

export type CipherEnvelope = {
  v: 1;
  alg: "AES-256-GCM";
  iv: string;
  ct: string;
  aad: string;
};

export const defaultKdfParams = {
  memory: 64 * 1024,
  iterations: 3,
  parallelism: 1
} satisfies Omit<KdfParams, "salt">;

export function secureRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function createSalt(): string {
  return bytesToBase64Url(secureRandomBytes(16));
}

export async function deriveMasterKey(masterPassword: string, params: KdfParams): Promise<CryptoKey> {
  const keyBytes = await argon2idAsync(utf8ToBytes(masterPassword), base64UrlToBytes(params.salt), {
    m: params.memory,
    t: params.iterations,
    p: params.parallelism,
    dkLen: 32,
    asyncTick: 10
  });

  return crypto.subtle.importKey("raw", bytesToArrayBuffer(keyBytes), "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function createVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function exportRawKey(key: CryptoKey): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.exportKey("raw", key));
}

export async function importVaultKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", bytesToArrayBuffer(rawKey), "AES-GCM", true, ["encrypt", "decrypt"]);
}

export async function encryptText(key: CryptoKey, plaintext: string, aad: string): Promise<CipherEnvelope> {
  const iv = secureRandomBytes(12);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: bytesToArrayBuffer(iv), additionalData: bytesToArrayBuffer(utf8ToBytes(aad)) },
    key,
    bytesToArrayBuffer(utf8ToBytes(plaintext))
  );

  return {
    v: 1,
    alg: "AES-256-GCM",
    iv: bytesToBase64Url(iv),
    ct: bytesToBase64Url(new Uint8Array(encrypted)),
    aad
  };
}

export async function decryptText(key: CryptoKey, envelope: CipherEnvelope): Promise<string> {
  if (envelope.v !== 1 || envelope.alg !== "AES-256-GCM") {
    throw new Error("Unsupported ciphertext envelope.");
  }

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: bytesToArrayBuffer(base64UrlToBytes(envelope.iv)),
      additionalData: bytesToArrayBuffer(utf8ToBytes(envelope.aad))
    },
    key,
    bytesToArrayBuffer(base64UrlToBytes(envelope.ct))
  );

  return bytesToUtf8(new Uint8Array(decrypted));
}

export async function encryptKey(wrappingKey: CryptoKey, vaultKey: CryptoKey): Promise<CipherEnvelope> {
  const raw = await exportRawKey(vaultKey);
  return encryptText(wrappingKey, bytesToBase64Url(raw), "keyvault:v1:vault-key");
}

export async function decryptKey(wrappingKey: CryptoKey, envelope: CipherEnvelope): Promise<CryptoKey> {
  const rawValue = await decryptText(wrappingKey, envelope);
  return importVaultKey(base64UrlToBytes(rawValue));
}
