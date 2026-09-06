import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { verifyLoginPassword } from "./password";
import { loginSchema } from "@/lib/validation/auth";
import { rateLimit, stableHash } from "@/lib/security/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 10
  },
  pages: {
    signIn: "/login"
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const emailHash = stableHash(parsed.data.email);
        const limited = rateLimit(`login:${emailHash}`, 5, 60_000);
        if (!limited.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user) return null;

        const valid = await verifyLoginPassword(parsed.data.password, user.passwordHash);
        if (!valid) {
          await prisma.failedLoginAttempt.create({
            data: {
              userId: user.id,
              emailHash,
              ipHash: stableHash("unknown")
            }
          });
          return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ]
});
