import type { DemoVaultItem } from "@/lib/vault/demo-data";

export type SecurityReport = {
  score: number;
  weak: DemoVaultItem[];
  reused: DemoVaultItem[];
  old: DemoVaultItem[];
  missingUrls: DemoVaultItem[];
  duplicateAccounts: DemoVaultItem[];
  recommendations: string[];
};

export function estimatePasswordScore(password: string): number {
  let score = Math.min(40, password.length * 2);
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  if (password.length >= 20) score += 15;
  if (/password|qwerty|admin|welcome/i.test(password)) score -= 35;
  return Math.max(0, Math.min(100, score));
}

export function passwordStrengthLabel(password: string): "Weak" | "Fair" | "Good" | "Strong" {
  const score = estimatePasswordScore(password);
  if (score < 40) return "Weak";
  if (score < 65) return "Fair";
  if (score < 85) return "Good";
  return "Strong";
}

export function calculateSecurityReport(items: DemoVaultItem[], twoFactorEnabled = false): SecurityReport {
  const weak = items.filter((item) => estimatePasswordScore(item.password) < 50 || item.password.length < 12);
  const passwordCounts = new Map<string, number>();
  const accountCounts = new Map<string, number>();
  const now = new Date();

  for (const item of items) {
    passwordCounts.set(item.password, (passwordCounts.get(item.password) ?? 0) + 1);
    accountCounts.set(`${item.website}:${item.username}`.toLowerCase(), (accountCounts.get(`${item.website}:${item.username}`.toLowerCase()) ?? 0) + 1);
  }

  const reused = items.filter((item) => (passwordCounts.get(item.password) ?? 0) > 1);
  const old = items.filter((item) => {
    const ageMs = now.getTime() - new Date(item.updatedAt).getTime();
    return ageMs > 1000 * 60 * 60 * 24 * 365;
  });
  const missingUrls = items.filter((item) => item.url.length === 0);
  const duplicateAccounts = items.filter((item) => (accountCounts.get(`${item.website}:${item.username}`.toLowerCase()) ?? 0) > 1);

  const penalties = weak.length * 12 + reused.length * 10 + old.length * 5 + missingUrls.length * 4 + duplicateAccounts.length * 8;
  const score = Math.max(0, Math.min(100, 100 - penalties + (twoFactorEnabled ? 5 : 0)));

  return {
    score,
    weak,
    reused,
    old,
    missingUrls,
    duplicateAccounts,
    recommendations: [
      weak.length ? "Replace weak and very short passwords." : "No weak passwords found.",
      reused.length ? "Use unique passwords for every account." : "No reused passwords found.",
      twoFactorEnabled ? "2FA is enabled for the account." : "Enable 2FA for account protection."
    ]
  };
}
