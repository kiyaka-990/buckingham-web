import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { verifyLoginCode } from "@/lib/otp";

declare module "next-auth" {
  interface Session {
    user: { id?: string; role?: "admin" | "client" } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
    Credentials({
      id: "otp",
      name: "Email code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "6-digit code", type: "text" },
      },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const code = String(creds?.code ?? "");
        if (!email || !code) return null;

        const result = await verifyLoginCode(email, code);
        if (!result.ok) return null;

        const user = await db.user.upsert({
          where: { email },
          update: {},
          create: { email, role: "client" },
        });
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    // Ensure Google users exist in our DB.
    signIn: async ({ user, account }) => {
      if (account?.provider === "google" && user.email) {
        await db.user.upsert({
          where: { email: user.email },
          update: {},
          create: { email: user.email, name: user.name ?? undefined, image: user.image ?? undefined, role: "client" },
        });
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      const email = user?.email ?? token.email;
      if (email) {
        const dbUser = await db.user.findUnique({ where: { email } });
        if (dbUser) {
          token.role = dbUser.role;
          token.uid = dbUser.id;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.role = (token.role as "admin" | "client") ?? "client";
        if (token.uid) session.user.id = token.uid as string;
      }
      return session;
    },
  },
});
