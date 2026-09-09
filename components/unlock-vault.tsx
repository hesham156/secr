"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Unlock } from "lucide-react";
import { toast } from "sonner";
import { decryptKey, deriveMasterKey } from "@/lib/crypto/client-encryption";
import type { CipherEnvelope } from "@/lib/crypto/client-encryption";
import { getVaultMetadata } from "@/lib/vault/actions";
import type { VaultMetadata } from "@/lib/vault/types";
import { useVault } from "@/components/vault/vault-provider";

export function UnlockVault() {
  const [working, setWorking] = useState(false);
  const [metadata, setMetadata] = useState<VaultMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const router = useRouter();
  const { unlock } = useVault();

  useEffect(() => {
    let active = true;
    getVaultMetadata()
      .then((result) => {
        if (!active) return;
        if (result.ok && result.data) {
          setMetadata(result.data);
        } else if (result.ok && !result.data) {
          router.replace("/setup-master-password");
        } else {
          toast.error("Could not load vault. Please sign in again.");
        }
      })
      .finally(() => {
        if (active) setLoadingMetadata(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!metadata) return;
    setWorking(true);
    const formData = new FormData(event.currentTarget);
    const masterPassword = String(formData.get("masterPassword") ?? "");

    try {
      const wrappingKey = await deriveMasterKey(masterPassword, {
        salt: metadata.kdfSalt,
        memory: metadata.kdfMemory,
        iterations: metadata.kdfIterations,
        parallelism: metadata.kdfParallelism
      });
      const envelope = JSON.parse(metadata.encryptedVaultKey) as CipherEnvelope;
      const vaultKey = await decryptKey(wrappingKey, envelope);
      await unlock(vaultKey);
      toast.success("Vault unlocked.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Incorrect master password.");
      setWorking(false);
    }
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
      {loadingMetadata ? (
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          Loading vault metadata…
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium">
            Master password
            <input className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2" name="masterPassword" type="password" autoComplete="current-password" required />
          </label>
          <button className="focus-ring w-full rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={working} type="submit">
            {working ? "Unlocking..." : "Unlock"}
          </button>
        </form>
      )}
    </section>
  );
}
