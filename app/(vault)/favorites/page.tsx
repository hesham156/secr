"use client";

import Link from "next/link";
import { useVault } from "@/components/vault/vault-provider";

export default function FavoritesPage() {
  const { items } = useVault();
  const favorites = items.filter((item) => item.favorite);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Favorites</h1>
      {favorites.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center text-[var(--muted)]">
          No favorites yet. Open a credential and mark it as a favorite.
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favorites.map((item) => (
            <Link className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-[var(--accent)]" href={`/vault/${item.id}`} key={item.id}>
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.website || item.username || "—"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
