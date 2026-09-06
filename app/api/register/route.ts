import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashLoginPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validation/auth";
import { rateLimit, stableHash } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid registration details." }, { status: 400 });
  }

  const emailHash = stableHash(parsed.data.email);
  const ipHash = stableHash(request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown");
  const limited = rateLimit(`register:${emailHash}:${ipHash}`, 3, 60_000);

  if (!limited.allowed) {
    return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const passwordHash = await hashLoginPassword(parsed.data.password);
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        securitySettings: { create: {} },
        auditLogs: { create: { event: "REGISTER", ipHash } }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    if (process.env.NODE_ENV !== "production") {
      console.error("Registration failed without sensitive payload.", error);
      return NextResponse.json({ message: "Database is unavailable. Check DATABASE_URL and run Prisma migrations." }, { status: 500 });
    }

    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
