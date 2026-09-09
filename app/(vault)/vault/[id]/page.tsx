"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { VaultItemDetail } from "@/components/vault/vault-item-detail";
import { useVault } from "@/components/vault/vault-provider";

export default function VaultItemPage() {
  const params = useParams<{ id: string }>();
  const { items } = useVault();
  const item = items.find((candidate) => candidate.id === params.id);

  if (!item) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Item not found</h1>
        <p className="text-sm text-[var(--muted)]">This credential may have been deleted.</p>
        <Link className="focus-ring inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white" href="/vault">
          Back to all passwords
        </Link>
      </div>
    );
  }

  return <VaultItemDetail item={item} />;
}
