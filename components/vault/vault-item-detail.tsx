"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { DemoVaultItem } from "@/lib/vault/demo-data";
import { passwordStrengthLabel } from "@/lib/security/password-health";

export function VaultItemDetail({ item }: { item: DemoVaultItem }) {
  const [visible, setVisible] = useState(false);

  async function copySecret(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
    window.setTimeout(async () => {
      try {
        const current = await navigator.clipboard.readText();
        if (current === value) await navigator.clipboard.writeText("");
      } catch {
        // Clipboard clearing is best effort and browser-dependent.
      }
    }, 20_000);
  }

  return (
    <section className="mx-auto max-w-3xl rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{item.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{item.website}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm" href={item.url} rel="noreferrer" target="_blank">
            <ExternalLink className="h-4 w-4" />
            Open
          </a>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm" type="button">
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm text-[var(--danger)]"
            onClick={() => window.confirm("Are you sure you want to delete this credential?")}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <Field label="Username" value={item.username} onCopy={() => copySecret(item.username, "Username")} />
        <div className="rounded-lg border border-[var(--line)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">Password</p>
              <p className="mt-2 font-mono text-lg">{visible ? item.password : "••••••••••••••••"}</p>
            </div>
            <div className="flex gap-2">
              <button aria-label={visible ? "Hide password" : "Show password"} className="focus-ring rounded-md border border-[var(--line)] p-2" onClick={() => setVisible((value) => !value)} type="button">
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button aria-label="Copy password" className="focus-ring rounded-md border border-[var(--line)] p-2" onClick={() => copySecret(item.password, "Password")} type="button">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">Strength: {passwordStrengthLabel(item.password)}</p>
        </div>
        <Field label="Category" value={item.category} />
        <Field label="Last updated" value={item.updatedAt} />
      </div>
    </section>
  );
}

function Field({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] p-4">
      <div>
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <p className="mt-2 break-all">{value}</p>
      </div>
      {onCopy ? (
        <button aria-label={`Copy ${label}`} className="focus-ring rounded-md border border-[var(--line)] p-2" onClick={onCopy} type="button">
          <Copy className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
