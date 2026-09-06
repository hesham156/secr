import { AppShell } from "@/components/app-shell";

export default function VaultLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
