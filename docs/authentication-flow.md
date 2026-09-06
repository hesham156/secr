# Authentication Flow

## Security Decision

Authentication is deliberately separate from the master password. The app login proves account ownership and creates a secure session. The master password decrypts vault data and never reaches the server. This means stolen sessions alone should not reveal encrypted vault contents.

## Registration

1. User submits email and login password.
2. Server validates input with Zod.
3. Server rate-limits registration.
4. Login password is hashed with bcrypt.
5. User and security settings are created.
6. Browser redirects to master password setup.

## Login

1. User submits email and login password.
2. Server rate-limits by email hash and IP hash.
3. Server compares password hash.
4. If TOTP is enabled, the user must pass TOTP or a recovery code flow.
5. Auth.js creates an HttpOnly cookie session. Credentials auth in Auth.js v5 requires JWT session strategy; KeyVault uses that JWT only inside Auth.js-managed HttpOnly cookies, never in `localStorage`.
6. User still needs to unlock the vault with master password.

## 2FA

TOTP secrets are stored encrypted. A production hardening pass should encrypt TOTP at the application layer with a server key from a KMS, rotate that key, and restrict access. Recovery codes are one-way hashed and marked used.

## Sessions

- HttpOnly cookies.
- Secure cookies in production.
- SameSite Lax.
- Expiration configured by Auth.js.
- No JWT in `localStorage`.
- Credentials login uses Auth.js JWT session strategy because database session strategy is not supported for credentials in Auth.js v5.

## Error Handling

Authentication errors are generic to the user. Detailed operational errors may be logged server-side, but never with passwords, master passwords, TOTP tokens, recovery codes, or plaintext vault values.
