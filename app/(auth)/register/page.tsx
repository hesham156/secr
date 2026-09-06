import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AuthPanel } from "@/components/auth-panel";

export default function RegisterPage() {
  return (
    <main className="min-h-screen px-4 py-10 md:grid md:place-items-center">
      <AuthPanel
        title="Create your KeyVault account"
        description="Use a strong login password for authentication. You will create a separate master password for vault encryption next."
        icon={<KeyRound aria-hidden className="h-6 w-6" />}
        mode="register"
      />
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already registered?{" "}
        <Link className="font-semibold text-[var(--accent)]" href="/login">
          Sign in
        </Link>
      </p>
    </main>
  );
}
