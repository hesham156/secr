import { PasswordGenerator } from "@/components/password-generator";

export default function PasswordGeneratorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Password Generator</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Generated locally with Web Crypto secure randomness.</p>
      </div>
      <PasswordGenerator />
    </div>
  );
}
