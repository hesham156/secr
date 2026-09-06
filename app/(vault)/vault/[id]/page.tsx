import { notFound } from "next/navigation";
import { VaultItemDetail } from "@/components/vault/vault-item-detail";
import { demoVaultItems } from "@/lib/vault/demo-data";

export default async function VaultItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = demoVaultItems.find((candidate) => candidate.id === id);
  if (!item) notFound();

  return <VaultItemDetail item={item} />;
}
