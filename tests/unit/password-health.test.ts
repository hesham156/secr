import { describe, expect, it } from "vitest";
import { calculateSecurityReport, estimatePasswordScore } from "@/lib/security/password-health";
import { demoVaultItems } from "@/lib/vault/demo-data";

describe("password health", () => {
  it("scores longer mixed passwords higher than very short passwords", () => {
    expect(estimatePasswordScore("CorrectHorseBatteryStaple!52")).toBeGreaterThan(estimatePasswordScore("short7"));
  });

  it("detects reused passwords locally", () => {
    const report = calculateSecurityReport(demoVaultItems);
    expect(report.reused.map((item) => item.id)).toContain("github");
    expect(report.reused.map((item) => item.id)).toContain("cloud");
  });
});
