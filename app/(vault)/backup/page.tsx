import { BackupPanel } from "@/components/backup-panel";

export default function BackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Backup</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Exports use encrypted `.keyvault` files. Plaintext export is intentionally absent.</p>
      </div>
      <BackupPanel />
    </div>
  );
}
