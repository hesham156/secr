import Link from "next/link";
import { Plus } from "lucide-react";

export default function SecureNotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Secure Notes</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Notes use the same client-side AES-GCM field encryption.</p>
        </div>
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white" href="/vault/new">
          <Plus className="h-4 w-4" />
          Add
        </Link>
      </div>
      <section className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center text-[var(--muted)]">
        No secure notes yet.
      </section>
    </div>
  );
}
