"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashLoginPassword } from "./password";
import { registerSchema } from "@/lib/validation/auth";
import { rateLimit, stableHash } from "@/lib/security/rate-limit";

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { ok: false, message: "Invalid registration details." };
  }

  const key = `register:${stableHash(parsed.data.email)}`;
  if (!rateLimit(key, 3, 60_000).allowed) {
    return { ok: false, message: "Too many attempts. Try again later." };
  }

  const passwordHash = await hashLoginPassword(parsed.data.password);

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      securitySettings: { create: {} },
      auditLogs: { create: { event: "REGISTER" } }
    }
  });

  redirect("/setup-master-password");
}
