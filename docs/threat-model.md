# Threat Model

KeyVault is not claimed to be 100% secure. It uses defense in depth and should receive recurring security review, dependency review, penetration testing, and careful operational hardening before real production use.

| Threat | Risk | Mitigation |
| --- | --- | --- |
| Database leak | Attackers obtain vault rows and user records. | Vault fields are AES-256-GCM ciphertext. Master password and derived key are never stored. Password hashes use bcrypt. Database user should have least privilege and provider encryption at rest. |
| XSS | Malicious script reads decrypted vault memory. | Strong CSP, no `dangerouslySetInnerHTML`, React output escaping, Zod validation, short decrypted lifetime, auto-lock. XSS remains a top critical risk. |
| CSRF | Attacker triggers authenticated mutations. | Auth.js CSRF for auth endpoints, SameSite cookies, server validation, route authorization. |
| Stolen session | Attacker uses a valid session cookie. | HttpOnly Secure SameSite cookies, session expiration, audit logging, optional TOTP, master password still required to unlock vault contents. |
| Malicious server | Server serves altered JavaScript to capture secrets. | Zero-knowledge reduces storage exposure but cannot fully defeat malicious delivered client code. Use signed builds, deployment controls, SRI where applicable, and supply-chain review. |
| Brute force | Login or master password guessing. | Rate limits for auth-sensitive routes, strong master password UX, Argon2id cost, bcrypt for login passwords, generic errors. |
| Clipboard leaks | Copied secrets remain available. | Explicit copy action, toast, best-effort clipboard clearing timeout, avoid console logging. |
| Browser extensions | Extension reads page or clipboard. | Warn users, minimize reveal time, lock on inactivity. Cannot fully mitigate malicious extensions. |
| Lost master password | User loses decryption capability. | Clear warning during setup. Optional one-time emergency recovery key bundle. Without it, recovery is impossible by design. |
| MITM | Network attacker observes or tampers with traffic. | HTTPS required in production, HSTS headers, Secure cookies. Development allows localhost HTTP only. |
| Supply chain | Dependency compromise. | Pin dependencies, use lockfiles, run audits, prefer maintained crypto libraries and Web Crypto primitives, review updates. |
| SSRF | URL/favicons fetch internal resources. | Server never fetches user-provided URLs. Client normalizes domains and uses a constrained favicon endpoint. |

## Non-Goals

- The server cannot recover plaintext vault data.
- Offline unencrypted caching is not implemented.
- Plaintext export is intentionally not available by default.
