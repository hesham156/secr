import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-4 py-10 md:grid md:place-items-center">
      <AuthPanel
        title="Sign in to KeyVault"
        description="Your account login opens a secure session. Your master password is requested separately and never reaches the server."
        icon={<ShieldCheck aria-hidden className="h-6 w-6" />}
        mode="login"
      />
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        New here?{" "}
        <Link className="font-semibold text-[var(--accent)]" href="/register">
          Create an account
        </Link>
      </p>
    </main>
  );
}
