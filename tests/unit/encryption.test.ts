import { describe, expect, it } from "vitest";
import { createVaultKey, decryptText, encryptText } from "@/lib/crypto/client-encryption";

describe("client encryption", () => {
  it("decrypts encrypted text back to the original value", async () => {
    const key = await createVaultKey();
    const envelope = await encryptText(key, "secret value", "test:aad");

    await expect(decryptText(key, envelope)).resolves.toBe("secret value");
  });

  it("fails when the iv changes", async () => {
    const key = await createVaultKey();
    const envelope = await encryptText(key, "secret value", "test:aad");

    await expect(decryptText(key, { ...envelope, iv: "AAAAAAAAAAAAAAAA" })).rejects.toThrow();
  });

  it("fails when the key changes", async () => {
    const key = await createVaultKey();
    const wrongKey = await createVaultKey();
    const envelope = await encryptText(key, "secret value", "test:aad");

    await expect(decryptText(wrongKey, envelope)).rejects.toThrow();
  });
});
