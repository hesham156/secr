import { AlertTriangle, Heart, KeyRound, ShieldCheck, Timer } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { demoVaultItems } from "@/lib/vault/demo-data";
import { calculateSecurityReport } from "@/lib/security/password-health";

export default function DashboardPage() {
  const report = calculateSecurityReport(demoVaultItems);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Unlocked vault insights are calculated locally in the browser in production.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Security Score" value={`${report.score}/100`} detail="Based on local password health checks" icon={<ShieldCheck className="h-5 w-5" />} />
        <MetricCard label="Passwords" value={String(demoVaultItems.length)} detail="Encrypted records in the vault" icon={<KeyRound className="h-5 w-5" />} />
        <MetricCard label="Weak" value={String(report.weak.length)} detail="Needs attention soon" icon={<AlertTriangle className="h-5 w-5" />} />
        <MetricCard label="Favorites" value={String(demoVaultItems.filter((item) => item.favorite).length)} detail="Pinned credentials" icon={<Heart className="h-5 w-5" />} />
      </div>
      <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)]">
        <div className="border-b border-[var(--line)] p-4">
          <h2 className="font-semibold">Recently Added</h2>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {demoVaultItems.map((item) => (
            <div className="flex items-center justify-between p-4" key={item.id}>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-[var(--muted)]">{item.website}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Timer className="h-4 w-4" />
                {item.updatedAt}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
