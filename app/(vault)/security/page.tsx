"use client";

import { AlertTriangle, CheckCircle2, Repeat, Timer } from "lucide-react";
import { useVault } from "@/components/vault/vault-provider";
import { calculateSecurityReport } from "@/lib/security/password-health";

export default function SecurityPage() {
  const { items } = useVault();
  const report = calculateSecurityReport(items);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Security Center</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Health analysis is local. Passwords are not sent to third-party services.</p>
      </div>
      <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
        <p className="text-sm font-medium text-[var(--muted)]">Security Score</p>
        <p className="mt-2 text-5xl font-semibold">{report.score}</p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <Finding icon={<AlertTriangle className="h-5 w-5" />} label="Weak passwords" count={report.weak.length} />
        <Finding icon={<Repeat className="h-5 w-5" />} label="Reused passwords" count={report.reused.length} />
        <Finding icon={<Timer className="h-5 w-5" />} label="Old passwords" count={report.old.length} />
        <Finding icon={<CheckCircle2 className="h-5 w-5" />} label="Duplicate accounts" count={report.duplicateAccounts.length} />
      </div>
      <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
        <h2 className="font-semibold">Recommendations</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          {report.recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Finding({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[var(--accent)]">{icon}</div>
          <p className="font-medium">{label}</p>
        </div>
        <p className="text-2xl font-semibold">{count}</p>
      </div>
    </section>
  );
}
