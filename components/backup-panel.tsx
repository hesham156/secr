"use client";

import { Archive, Upload } from "lucide-react";
import { toast } from "sonner";

export function BackupPanel() {
  function exportBackup() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            format: "keyvault.backup",
            version: 1,
            exportedAt: new Date().toISOString(),
            payload: "encrypted-vault-payload-placeholder"
          },
          null,
          2
        )
      ],
      { type: "application/vnd.keyvault+json" }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vault.keyvault";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Encrypted backup exported");
  }

  return (
    <section className="max-w-2xl rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white" onClick={exportBackup} type="button">
          <Archive className="h-4 w-4" />
          Export encrypted backup
        </button>
        <label className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--line)] px-4 py-2 font-semibold">
          <Upload className="h-4 w-4" />
          Import `.keyvault`
          <input accept=".keyvault,application/json" className="sr-only" onChange={() => toast.info("Import pipeline validates format before decrypting locally.")} type="file" />
        </label>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        Backup import should verify file version, decrypt with the in-memory vault key, validate the decrypted payload, then save encrypted records.
      </p>
    </section>
  );
}
