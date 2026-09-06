import { ShieldCheck } from "lucide-react";

export default function TwoFactorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Two-factor Authentication</h1>
      <section className="max-w-xl rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
        <ShieldCheck className="mb-3 h-6 w-6 text-[var(--accent)]" />
        <h2 className="font-semibold">TOTP ready</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          The schema and dependency layer support TOTP and recovery codes. Store TOTP secrets encrypted with a server-managed key before enabling in production.
        </p>
        <button className="focus-ring mt-4 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white" type="button">
          Set up authenticator
        </button>
      </section>
    </div>
  );
}
