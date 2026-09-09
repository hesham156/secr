"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Eye, EyeOff, ExternalLink, Heart, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useVault } from "@/components/vault/vault-provider";
import { VaultItemForm } from "@/components/vault/vault-item-form";
import { passwordStrengthLabel } from "@/lib/security/password-health";
import type { VaultItemView } from "@/lib/vault/types";

export function VaultItemDetail({ item }: { item: VaultItemView }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const { removeItem, toggleFavorite } = useVault();
  const router = useRouter();

  async function copySecret(value: string, label: string) {
    if (!value) return;
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

  async function onDelete() {
    if (!window.confirm("Are you sure you want to delete this credential?")) return;
    const ok = await removeItem(item.id);
    if (!ok) {
      toast.error("Could not delete the item.");
      return;
    }
    toast.success("Credential deleted.");
    router.push("/vault");
    router.refresh();
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Edit “{item.title}”</h1>
        <VaultItemForm item={item} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
      <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold">{item.title}</h1>
            {item.favorite ? <Heart className="h-5 w-5 fill-[var(--accent)] text-[var(--accent)]" /> : null}
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">{item.website || "—"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.url ? (
            <a className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm" href={item.url} rel="noreferrer" target="_blank">
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          ) : null}
          <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm" onClick={() => toggleFavorite(item.id)} type="button">
            <Heart className={`h-4 w-4 ${item.favorite ? "fill-[var(--accent)] text-[var(--accent)]" : ""}`} />
            {item.favorite ? "Unfavorite" : "Favorite"}
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm" onClick={() => setEditing(true)} type="button">
            <Pencil className="h-4 w-4" />
            Edit
          </button>
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm text-[var(--danger)]"
            onClick={onDelete}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        {item.username ? <Field label="Username" value={item.username} onCopy={() => copySecret(item.username, "Username")} /> : null}
        {item.password ? (
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
        ) : null}
        {item.notes ? (
          <div className="rounded-lg border border-[var(--line)] p-4">
            <p className="text-sm font-medium text-[var(--muted)]">Notes</p>
            <p className="mt-2 whitespace-pre-wrap break-words">{item.notes}</p>
          </div>
        ) : null}
        {item.category ? <Field label="Category" value={item.category} /> : null}
        {item.tags.length ? <Field label="Tags" value={item.tags.join(", ")} /> : null}
        <Field label="Last updated" value={new Date(item.updatedAt).toLocaleString()} />
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
