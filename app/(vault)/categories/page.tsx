import { demoVaultItems } from "@/lib/vault/demo-data";

export default function CategoriesPage() {
  const categories = Array.from(new Set(demoVaultItems.map((item) => item.category)));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Categories</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" key={category}>
            <h2 className="font-semibold">{category}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {demoVaultItems.filter((item) => item.category === category).length} encrypted items
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
