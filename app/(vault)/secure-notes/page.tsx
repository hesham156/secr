"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useVault } from "@/components/vault/vault-provider";

export default function SecureNotesPage() {
  const { items } = useVault();
  const notes = items.filter((item) => item.notes.trim().length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Secure Notes</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Notes use the same client-side AES-GCM field encryption.</p>
        </div>
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white" href="/vault/new">
          <Plus className="h-4 w-4" />
          Add
        </Link>
      </div>
      {notes.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center text-[var(--muted)]">
          No secure notes yet.
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((item) => (
            <Link className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-[var(--accent)]" href={`/vault/${item.id}`} key={item.id}>
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-[var(--muted)]">{item.notes}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
