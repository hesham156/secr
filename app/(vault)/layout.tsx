import { AppShell } from "@/components/app-shell";
import { VaultGuard } from "@/components/vault/vault-guard";

export default function VaultLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell>
      <VaultGuard>{children}</VaultGuard>
    </AppShell>
  );
}
