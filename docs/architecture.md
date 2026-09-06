# KeyVault Architecture

KeyVault is designed as a zero-knowledge password manager for one person or a small team. The server authenticates users, stores encrypted vault records, enforces authorization, rate limits sensitive actions, and writes non-sensitive audit events. The browser owns master-password handling, key derivation, vault encryption, password health analysis, search over decrypted values, clipboard behavior, and auto-lock.

## Security Decision

Sensitive vault data is encrypted client-side before it crosses the network. This reduces the blast radius of a database leak and prevents the application server from reading passwords, secure notes, recovery codes, or additional secrets. The tradeoff is intentional: if a user loses the master password and has not saved an emergency recovery key, the server cannot recover the vault.

## Layers

- UI: React Server Components for non-sensitive shells and Client Components for unlock, encryption, decrypted vault views, generator, security center, backup, and clipboard flows.
- Authentication: Auth.js credentials provider with Prisma sessions, HttpOnly cookies, CSRF protection from Auth.js, bcrypt password hashes, optional TOTP, recovery codes, and future WebAuthn/passkey tables.
- Encryption: Web Crypto AES-256-GCM for vault fields. Argon2id derives a key encryption key from the master password and per-user salt. The master password never leaves the browser.
- Data: PostgreSQL through Prisma. Vault items contain ciphertext envelopes rather than plaintext fields.
- Validation: Zod schemas at server boundaries and client form boundaries.
- Security services: rate limiting, audit logging without sensitive values, domain normalization, SSRF-resistant favicon/domain handling.

## Folder Structure

- `app/`: Next.js App Router pages and route handlers.
- `components/`: UI building blocks and vault-specific client components.
- `lib/auth/`: authentication, password hashing, session helpers, TOTP helpers.
- `lib/crypto/`: browser cryptography, encrypted envelope format, backup format.
- `lib/security/`: password scoring, local health analysis, rate limiting, audit helpers.
- `lib/validation/`: Zod schemas.
- `lib/vault/`: server actions and vault mapping.
- `prisma/`: database schema.
- `tests/`: unit and integration tests.

## Trust Boundaries

- Browser memory can temporarily contain decrypted data after unlock.
- Server stores only authentication secrets, session records, encrypted vault blobs, safe hints, and audit metadata.
- Database compromise should not expose vault contents without the master password or recovery key.
- XSS is treated as a critical risk because malicious browser JavaScript can read decrypted data while the vault is unlocked.

## Privacy Rules

- No password or vault content is sent to external APIs.
- Password health analysis runs locally after decrypting in browser memory.
- Search runs locally over decrypted values.
- Favicons are fetched only through a constrained Google favicon URL using a normalized domain hint, not by server-side fetching arbitrary URLs.
