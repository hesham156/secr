"use client";

import { useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { estimatePasswordScore } from "@/lib/security/password-health";

const sets = {
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lower: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?"
};

const words = ["anchor", "signal", "river", "orbit", "glass", "ember", "north", "silver", "cobalt", "harbor"];

function randomIndex(max: number) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function makePassword(length: number, enabled: string[]) {
  const alphabet = enabled.join("");
  return Array.from({ length }, () => alphabet[randomIndex(alphabet.length)]).join("");
}

function makePassphrase() {
  return Array.from({ length: 5 }, () => words[randomIndex(words.length)]).join("-");
}

export function PasswordGenerator() {
  const [length, setLength] = useState(24);
  const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: true, passphrase: false });
  const password = useMemo(() => {
    if (options.passphrase) return makePassphrase();
    const enabled = Object.entries(sets)
      .filter(([key]) => options[key as keyof typeof sets])
      .map(([, value]) => value);
    return makePassword(length, enabled.length ? enabled : [sets.lower]);
  }, [length, options]);

  async function copy() {
    await navigator.clipboard.writeText(password);
    toast.success("Password copied");
  }

  return (
    <section className="max-w-3xl rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Generated Password</h2>
          <p className="mt-1 break-all font-mono text-lg">{password}</p>
        </div>
        <div className="flex gap-2">
          <button aria-label="Regenerate password" className="focus-ring rounded-md border border-[var(--line)] p-2" onClick={() => setLength((value) => value + 0)} type="button">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button aria-label="Copy generated password" className="focus-ring rounded-md border border-[var(--line)] p-2" onClick={copy} type="button">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <label className="block text-sm font-medium">
          Length: {length}
          <input className="mt-2 w-full" disabled={options.passphrase} max={64} min={12} onChange={(event) => setLength(Number(event.target.value))} type="range" value={length} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["upper", "Uppercase"],
            ["lower", "Lowercase"],
            ["numbers", "Numbers"],
            ["symbols", "Symbols"],
            ["passphrase", "Passphrase"]
          ].map(([key, label]) => (
            <label className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm" key={key}>
              <input checked={options[key as keyof typeof options]} onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.checked }))} type="checkbox" />
              {label}
            </label>
          ))}
        </div>
        <div>
          <p className="text-sm font-medium">Estimated strength</p>
          <div className="mt-2 h-2 rounded-full bg-[color-mix(in_srgb,var(--line)_70%,transparent)]">
            <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${estimatePasswordScore(password)}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
