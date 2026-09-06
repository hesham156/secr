import Link from "next/link";
import {
  Archive,
  Gauge,
  Heart,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  NotebookText,
  Settings,
  ShieldAlert,
  Tags
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vault", label: "All Passwords", icon: LockKeyhole },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/secure-notes", label: "Secure Notes", icon: NotebookText },
  { href: "/password-generator", label: "Password Generator", icon: KeyRound },
  { href: "/security", label: "Security Center", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/backup", label: "Backup", icon: Archive }
];

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-[var(--line)] bg-[var(--panel)] lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent)] text-white">
            <Gauge aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">KeyVault</p>
            <p className="text-xs text-[var(--muted)]">Zero-knowledge vault</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="focus-ring flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[var(--foreground)]"
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>
        <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--background)_90%,transparent)] px-4 py-3 backdrop-blur md:px-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              aria-label="Search decrypted vault"
              className="focus-ring w-full rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 md:max-w-xl"
              placeholder="Search unlocked vault locally"
              type="search"
            />
            <Link className="focus-ring rounded-md bg-[var(--accent)] px-4 py-2 text-center text-sm font-semibold text-white" href="/vault/new">
              Quick Add
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 md:px-7">{children}</main>
      </div>
    </div>
  );
}
