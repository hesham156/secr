"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useVault } from "./vault-provider";

export function VaultGuard({ children }: { children: ReactNode }) {
  const { status } = useVault();
  const router = useRouter();

  useEffect(() => {
    if (status !== "ready") router.replace("/unlock");
  }, [status, router]);

  if (status !== "ready") {
    return (
      <div className="grid min-h-[60vh] place-items-center text-[var(--muted)]">
        <div className="flex items-center gap-2">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          <span>Vault is locked. Redirecting to unlock…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
