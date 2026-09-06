import Link from "next/link";
import { demoVaultItems } from "@/lib/vault/demo-data";

export default function FavoritesPage() {
  const favorites = demoVaultItems.filter((item) => item.favorite);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Favorites</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {favorites.map((item) => (
          <Link className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4" href={`/vault/${item.id}`} key={item.id}>
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.website}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
