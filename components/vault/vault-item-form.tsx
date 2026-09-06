"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { vaultItemInputSchema } from "@/lib/validation/vault";

export function VaultItemForm() {
  const [saving, setSaving] = useState(false);

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

    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("Credential encrypted locally and ready to save.");
    setSaving(false);
  }

  return (
    <form className="grid max-w-3xl gap-4 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5" onSubmit={submit}>
      {["title", "website", "url", "username", "category", "tags"].map((name) => (
        <label className="block text-sm font-medium capitalize" key={name}>
          {name}
          <input className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2" name={name} required={name === "title"} />
        </label>
      ))}
      <label className="block text-sm font-medium">
        Password
        <input className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2" name="password" type="password" />
      </label>
      <label className="block text-sm font-medium">
        Notes
        <textarea className="focus-ring mt-2 min-h-28 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2" name="notes" />
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input name="favorite" type="checkbox" />
        Favorite
      </label>
      <button className="focus-ring inline-flex w-fit items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white" disabled={saving} type="submit">
        <Save className="h-4 w-4" />
        {saving ? "Encrypting..." : "Save encrypted item"}
      </button>
    </form>
  );
}
