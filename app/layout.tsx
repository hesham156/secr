import type { Metadata } from "next";
import { Toaster } from "sonner";
import { VaultProvider } from "@/components/vault/vault-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "KeyVault",
  description: "A zero-knowledge password manager for personal use and small teams."
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <VaultProvider>{children}</VaultProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
