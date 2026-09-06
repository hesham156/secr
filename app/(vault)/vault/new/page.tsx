import { VaultItemForm } from "@/components/vault/vault-item-form";

export default function NewVaultItemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Add Credential</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Fields are encrypted client-side before being saved.</p>
      </div>
      <VaultItemForm />
    </div>
  );
}
