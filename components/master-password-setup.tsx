"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Download, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { createSalt, createVaultKey, defaultKdfParams, deriveMasterKey, encryptKey } from "@/lib/crypto/client-encryption";
import { masterPasswordSchema } from "@/lib/validation/auth";
import { estimatePasswordScore } from "@/lib/security/password-health";
import { createVaultMetadata } from "@/lib/vault/actions";
import { useVault } from "@/components/vault/vault-provider";

export function MasterPasswordSetup() {
  const [score, setScore] = useState(0);
  const [working, setWorking] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const router = useRouter();
  const { unlock } = useVault();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    const formData = new FormData(event.currentTarget);
    const masterPassword = String(formData.get("masterPassword") ?? "");
    const confirm = String(formData.get("confirmMasterPassword") ?? "");

    if (masterPassword !== confirm) {
      toast.error("Master passwords do not match.");
      setWorking(false);
      return;
    }

    const parsed = masterPasswordSchema.safeParse(masterPassword);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Choose a stronger master password.");
      setWorking(false);
      return;
    }

    try {
      const salt = createSalt();
      const wrappingKey = await deriveMasterKey(masterPassword, { salt, ...defaultKdfParams });
      const newVaultKey = await createVaultKey();
      const encryptedVaultKey = await encryptKey(wrappingKey, newVaultKey);

      const result = await createVaultMetadata({
        kdfSalt: salt,
        kdfMemory: defaultKdfParams.memory,
        kdfIterations: defaultKdfParams.iterations,
        kdfParallelism: defaultKdfParams.parallelism,
        encryptedVaultKey: JSON.stringify(encryptedVaultKey)
      });

      if (!result.ok) {
        toast.error(result.message);
        setWorking(false);
        return;
      }

      setVaultKey(newVaultKey);
      setRecoveryKey(createSalt() + "." + createSalt());
      toast.success("Encrypted vault created. Save your emergency recovery key now.");
    } catch {
      toast.error("Could not create the encrypted vault. Please try again.");
    }
    setWorking(false);
  }

  function downloadRecoveryKey() {
    if (!recoveryKey) return;
    const blob = new Blob([`KeyVault emergency recovery key\n\n${recoveryKey}\n\nStore this offline. It is shown only once.\n`], {
      type: "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "keyvault-recovery-key.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function continueToVault() {
    if (!vaultKey) return;
    await unlock(vaultKey);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--accent)] text-white">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Set up master password</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            We cannot recover your vault if you lose your master password. Save the emergency recovery key during setup.
          </p>
        </div>
      </div>
      {recoveryKey ? null : (
        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium">
            Master password
            <input
              className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
              name="masterPassword"
              onChange={(event) => setScore(estimatePasswordScore(event.target.value))}
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
          <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--line)_70%,transparent)]">
            <div className="h-2 rounded-full bg-[var(--accent)] transition-all" style={{ width: `${score}%` }} />
          </div>
          <label className="block text-sm font-medium">
            Confirm master password
            <input className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2" name="confirmMasterPassword" type="password" autoComplete="new-password" required />
          </label>
          <button className="focus-ring rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={working} type="submit">
            {working ? "Deriving key..." : "Create encrypted vault"}
          </button>
        </form>
      )}
      {recoveryKey ? (
        <div className="space-y-5">
          <div className="rounded-lg border border-[var(--warning)] p-4">
            <p className="font-semibold">Emergency recovery key</p>
            <p className="mt-2 break-all font-mono text-sm">{recoveryKey}</p>
            <button
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm"
              onClick={downloadRecoveryKey}
              type="button"
            >
              <Download className="h-4 w-4" />
              Download once
            </button>
          </div>
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white"
            onClick={continueToVault}
            type="button"
          >
            <ArrowRight className="h-4 w-4" />
            I saved it, continue to vault
          </button>
        </div>
      ) : null}
    </section>
  );
}
