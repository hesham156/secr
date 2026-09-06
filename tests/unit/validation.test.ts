import { describe, expect, it } from "vitest";
import { vaultItemInputSchema } from "@/lib/validation/vault";

describe("vault validation", () => {
  it("accepts normalized credential input", () => {
    const parsed = vaultItemInputSchema.safeParse({
      title: "GitHub",
      url: "github.com",
      tags: ["code"],
      favorite: true
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects malformed urls", () => {
    const parsed = vaultItemInputSchema.safeParse({
      title: "Bad",
      url: "file:///etc/passwd",
      tags: [],
      favorite: false
    });

    expect(parsed.success).toBe(false);
  });
});
