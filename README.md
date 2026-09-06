# KeyVault

KeyVault is a professional Next.js password manager starter built around privacy by design and security by design. It uses a zero-knowledge architecture as far as a browser web app can: vault secrets are encrypted client-side before storage, and the master password is never sent to the server.

This project is not "100% secure." Treat it as a strong production-oriented foundation that still needs security review, dependency review, deployment hardening, penetration testing, and operational controls before storing real secrets.

## Stack

- Next.js 16.3.4 with App Router
- TypeScript
- PostgreSQL
- Prisma ORM 6.19.3. Prisma 8 is the newest CLI track, but the current Auth.js Prisma adapter supports Prisma up to 6, so this project pins the compatible ORM line for authentication stability.
- Tailwind CSS
- Auth.js
- AES-256-GCM through Web Crypto
- Argon2id through `@noble/hashes`
- Zod validation
- Vitest

## Security Architecture

Read these first:

- [Architecture](./docs/architecture.md)
- [Threat Model](./docs/threat-model.md)
- [Encryption Flow](./docs/encryption-flow.md)
- [Authentication Flow](./docs/authentication-flow.md)

Key decisions:

- App login password is separate from master password.
- Master password is not stored, logged, sent to the server, placed in cookies, or placed in `localStorage`.
- Auth.js credentials login uses JWT session strategy because Auth.js v5 requires it, but the session token is kept in HttpOnly cookies and is not exposed through `localStorage`.
- Vault key is generated locally and encrypted by a key derived from the master password.
- Vault item fields are stored as AES-GCM ciphertext envelopes.
- Search, password health analysis, reused-password detection, duplicate detection, and security score are local after unlock.
- Plaintext export is not implemented by default.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and provide real values:

```bash
cp .env.example .env
```

3. Start PostgreSQL and run Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Run the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Testing

```bash
npm test
```

The current tests cover encryption round-trip, tamper failure for IV/key changes, validation, and local password health detection.

## Production Checklist

- Use HTTPS only; localhost HTTP is acceptable for development.
- Do not set `NODE_ENV` to custom values on Railway or any host. Leave it unset or set it exactly to `production`; values like `Production`, `prod`, or `staging` can break Next.js and React build/runtime assumptions. The `npm run build` script forces `NODE_ENV=production` defensively, but the hosting environment should still be corrected.
- On Railway, set `AUTH_URL` and `NEXTAUTH_URL` to the public app URL, for example `https://secr-production.up.railway.app`, and keep `AUTH_SECRET` stable.
- `npm start` runs `prisma migrate deploy` before `next start`, so Railway applies committed migrations before serving traffic.
- Set strong `AUTH_SECRET` and `RATE_LIMIT_SECRET`.
- Use managed PostgreSQL encryption at rest.
- Restrict the database user to least privilege.
- Replace in-memory rate limiting with Redis or another shared store.
- Encrypt TOTP secrets with a server-side KMS key and rotate it.
- Add email verification and password reset flows that never touch the master password.
- Add passkey registration and authentication using the included WebAuthn-ready schema.
- Run dependency audit and lockfile review.
- Review CSP for any added scripts, analytics, or assets.
- Add e2e tests for auth, unlock, auto-lock, backup restore, and CRUD.

## Pages

- `/login`
- `/register`
- `/setup-master-password`
- `/unlock`
- `/dashboard`
- `/vault`
- `/vault/new`
- `/vault/[id]`
- `/favorites`
- `/categories`
- `/secure-notes`
- `/password-generator`
- `/security`
- `/settings`
- `/settings/security`
- `/settings/2fa`
- `/backup`

## Security Review Notes

- No custom cryptographic algorithm is invented.
- `Math.random` is not used for security-sensitive generation.
- Sensitive values should never be logged.
- Decrypted values should remain in memory for the shortest practical time.
- XSS remains the most important browser-app risk because unlocked vault data exists in browser memory.
- A malicious server can still serve malicious client JavaScript; mitigate with signed builds, deployment controls, code review, and supply-chain hardening.
