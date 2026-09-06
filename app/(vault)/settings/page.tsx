import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" href="/settings/security">
          <ShieldCheck className="mb-3 h-5 w-5 text-[var(--accent)]" />
          <h2 className="font-semibold">Security</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Auto-lock, sessions, and master password reminders.</p>
        </Link>
        <Link className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" href="/settings/2fa">
          <KeyRound className="mb-3 h-5 w-5 text-[var(--accent)]" />
          <h2 className="font-semibold">Two-factor authentication</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">TOTP and recovery code settings.</p>
        </Link>
      </div>
    </div>
  );
}
