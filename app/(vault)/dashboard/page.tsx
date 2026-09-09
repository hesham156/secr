"use client";

import { AlertTriangle, Heart, KeyRound, ShieldCheck, Timer } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { useVault } from "@/components/vault/vault-provider";
import { calculateSecurityReport } from "@/lib/security/password-health";

export default function DashboardPage() {
  const { items } = useVault();
  const report = calculateSecurityReport(items);
  const recent = items.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Unlocked vault insights are calculated locally in the browser.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Security Score" value={`${report.score}/100`} detail="Based on local password health checks" icon={<ShieldCheck className="h-5 w-5" />} />
        <MetricCard label="Passwords" value={String(items.length)} detail="Encrypted records in the vault" icon={<KeyRound className="h-5 w-5" />} />
        <MetricCard label="Weak" value={String(report.weak.length)} detail="Needs attention soon" icon={<AlertTriangle className="h-5 w-5" />} />
        <MetricCard label="Favorites" value={String(items.filter((item) => item.favorite).length)} detail="Pinned credentials" icon={<Heart className="h-5 w-5" />} />
      </div>
      <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)]">
        <div className="border-b border-[var(--line)] p-4">
          <h2 className="font-semibold">Recently Added</h2>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--muted)]">Your vault is empty. Add your first credential to get started.</div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {recent.map((item) => (
              <div className="flex items-center justify-between p-4" key={item.id}>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-[var(--muted)]">{item.website}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Timer className="h-4 w-4" />
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
