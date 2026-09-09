"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { useVault } from "@/components/vault/vault-provider";
import { vaultItemInputSchema } from "@/lib/validation/vault";
import type { VaultItemView } from "@/lib/vault/types";

type VaultItemFormProps = {
  item?: VaultItemView;
  onSaved?: () => void;
  onCancel?: () => void;
};

const textFields = [
  { name: "title", label: "Title", required: true },
  { name: "website", label: "Website", required: false },
  { name: "url", label: "URL", required: false },
  { name: "username", label: "Username", required: false },
  { name: "category", label: "Category", required: false }
] as const;

export function VaultItemForm({ item, onSaved, onCancel }: VaultItemFormProps) {
  const [saving, setSaving] = useState(false);
  const { addItem, editItem } = useVault();
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const parsed = vaultItemInputSchema.safeParse({
      title: String(formData.get("title") ?? ""),
      website: String(formData.get("website") ?? ""),
      url: String(formData.get("url") ?? ""),
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      category: String(formData.get("category") ?? ""),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      favorite: formData.get("favorite") === "on"
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid vault item.");
      setSaving(false);
      return;
    }

    const success = item ? await editItem(item.id, parsed.data) : await addItem(parsed.data);
    if (!success) {
      toast.error("Could not save the item. Please try again.");
      setSaving(false);
      return;
    }

    toast.success(item ? "Credential updated." : "Credential encrypted and saved.");
    setSaving(false);
    if (onSaved) {
      onSaved();
    } else {
      router.push("/vault");
      router.refresh();
    }
  }

  return (
    <form className="grid max-w-3xl gap-4 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5" onSubmit={submit}>
      {textFields.map((field) => (
        <label className="block text-sm font-medium" key={field.name}>
          {field.label}
          <input
            className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
            defaultValue={item ? (item[field.name] as string) : ""}
            name={field.name}
            required={field.required}
          />
        </label>
      ))}
      <label className="block text-sm font-medium">
        Tags (comma separated)
        <input
          className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
          defaultValue={item ? item.tags.join(", ") : ""}
          name="tags"
        />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
          defaultValue={item ? item.password : ""}
          name="password"
          type="password"
        />
      </label>
      <label className="block text-sm font-medium">
        Notes
        <textarea
          className="focus-ring mt-2 min-h-28 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
          defaultValue={item ? item.notes : ""}
          name="notes"
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input defaultChecked={item ? item.favorite : false} name="favorite" type="checkbox" />
        Favorite
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="focus-ring inline-flex w-fit items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={saving} type="submit">
          <Save className="h-4 w-4" />
          {saving ? "Encrypting..." : "Save encrypted item"}
        </button>
        {onCancel ? (
          <button className="focus-ring inline-flex w-fit items-center gap-2 rounded-md border border-[var(--line)] px-4 py-2 font-semibold" onClick={onCancel} type="button">
            <X className="h-4 w-4" />
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
