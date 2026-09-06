"use client";

import { useState, type FormEvent } from "react";
import { Unlock } from "lucide-react";
import { toast } from "sonner";
import { defaultKdfParams, deriveMasterKey } from "@/lib/crypto/client-encryption";

export function UnlockVault() {
  const [working, setWorking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    const formData = new FormData(event.currentTarget);
    const masterPassword = String(formData.get("masterPassword") ?? "");
    const preview = sessionStorage.getItem("keyvault.setup.preview");
    if (!preview) {
      toast.error("Vault setup metadata is not available in this demo session.");
      setWorking(false);
      return;
    }

    const metadata = JSON.parse(preview) as { salt: string };
    await deriveMasterKey(masterPassword, { salt: metadata.salt, ...defaultKdfParams });
    toast.success("Vault key derived in memory. Redirecting to vault would happen now.");
    setWorking(false);
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent)] text-white">
          <Unlock className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Unlock vault</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">The master password stays in this browser session only.</p>
        </div>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium">
          Master password
          <input className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2" name="masterPassword" type="password" autoComplete="current-password" required />
        </label>
        <button className="focus-ring w-full rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white" disabled={working} type="submit">
          {working ? "Unlocking..." : "Unlock"}
        </button>
      </form>
    </section>
  );
}
