"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

type AuthPanelProps = {
  title: string;
  description: string;
  icon: ReactNode;
  mode: "login" | "register";
  nextPath?: string;
};

export function AuthPanel({ title, description, icon, mode, nextPath = "/dashboard" }: AuthPanelProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const values = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    };
    const parsed = (mode === "login" ? loginSchema : registerSchema).safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your input.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data)
        });
        const payload = (await response.json().catch(() => ({}))) as { message?: string };

        if (!response.ok) {
          toast.error(payload.message ?? "Registration failed.");
          setLoading(false);
          return;
        }

        toast.success("Account created. Set up your master password next.");
        router.push("/setup-master-password");
        router.refresh();
        return;
      }

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false
      });

      if (result?.error) {
        toast.error("Invalid email or password.");
        setLoading(false);
        return;
      }

      toast.success("Signed in. Unlock your vault with your master password.");
      router.push(nextPath);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
      </div>
      <form
        action={mode === "login" ? "/api/auth/callback/credentials" : "/api/register"}
        className="space-y-4"
        method="post"
        onSubmit={submit}
      >
        <label className="block text-sm font-medium">
          Email
          <input
            className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            className="focus-ring mt-2 w-full rounded-md border border-[var(--line)] bg-transparent px-3 py-2"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={12}
            required
          />
        </label>
        <button
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 font-semibold text-white disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <ArrowRight aria-hidden className="h-4 w-4" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </section>
  );
}
