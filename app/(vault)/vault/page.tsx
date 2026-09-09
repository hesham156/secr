"use client";

import Link from "next/link";
import { ExternalLink, Heart, Plus } from "lucide-react";
import { useVault } from "@/components/vault/vault-provider";
import { passwordStrengthLabel } from "@/lib/security/password-health";

export default function VaultPage() {
  const { items } = useVault();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">All Passwords</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Passwords stay hidden by default and are decrypted only after vault unlock.</p>
        </div>
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white" href="/vault/new">
          <Plus className="h-4 w-4" />
          Add Credential
        </Link>
      </div>
      {items.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center text-[var(--muted)]">
          No credentials yet. Use “Add Credential” to store your first encrypted entry.
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <Link className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-[var(--accent)]" href={`/vault/${item.id}`} key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{item.title}</h2>
                    {item.favorite ? <Heart className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" /> : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.username || "—"}</p>
                  {item.category ? <p className="mt-3 text-xs font-medium uppercase tracking-normal text-[var(--muted)]">{item.category}</p> : null}
                </div>
                <ExternalLink className="h-4 w-4 text-[var(--muted)]" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                {item.password ? <span className="rounded-md border border-[var(--line)] px-2 py-1">Strength: {passwordStrengthLabel(item.password)}</span> : null}
                <span className="rounded-md border border-[var(--line)] px-2 py-1">Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
