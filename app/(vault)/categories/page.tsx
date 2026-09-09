"use client";

import { useVault } from "@/components/vault/vault-provider";

export default function CategoriesPage() {
  const { items } = useVault();
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Categories</h1>
      {categories.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center text-[var(--muted)]">
          No categories yet. Add a category when you create or edit a credential.
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" key={category}>
              <h2 className="font-semibold">{category}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {items.filter((item) => item.category === category).length} encrypted items
              </p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
