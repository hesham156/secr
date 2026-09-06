# Encryption Flow

## Security Decision

KeyVault uses Web Crypto AES-256-GCM and Argon2id. AES-GCM provides authenticated encryption, so modified ciphertext, IV, AAD, or key causes decryption to fail. Argon2id is selected for master-password key derivation because it is memory-hard and designed to resist GPU cracking better than simple hashes.

## Setup

1. User creates an app login password for authentication.
2. User creates a separate master password for vault encryption.
3. Browser generates a random 16-byte `kdfSalt`.
4. Browser derives a 256-bit key encryption key with Argon2id.
5. Browser generates a random 256-bit vault key.
6. Vault key is encrypted with the derived key and stored as `encryptedVaultKey`.
7. Optional emergency recovery key encrypts a recovery bundle once and is shown/downloaded one time.

## Unlock

1. Browser asks for master password.
2. Browser downloads non-sensitive KDF parameters and encrypted vault key.
3. Browser derives the key encryption key locally.
4. Browser decrypts the vault key locally.
5. Vault key stays in memory only for the unlocked session.
6. Logout or auto-lock clears the in-memory key and decrypted item cache.

## Vault Item Encryption

Each field is encrypted separately:

- `titleCipher`
- `websiteCipher`
- `urlCipher`
- `usernameCipher`
- `passwordCipher`
- `notesCipher`
- `extraCipher`

Each encryption operation uses a fresh 96-bit IV. The envelope format is:

```json
{
  "v": 1,
  "alg": "AES-256-GCM",
  "iv": "base64url",
  "ct": "base64url",
  "aad": "keyvault:v1:vault-item:field"
}
```

## Local Analysis

Password strength, reused password detection, search, duplicate detection, and security scoring run only after local decryption in browser memory. These values are not sent to APIs, logs, or server-rendered HTML.
