import type { ReactNode } from "react";

export function MetricCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <div className="text-[var(--accent)]">{icon}</div>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{detail}</p>
    </section>
  );
}
