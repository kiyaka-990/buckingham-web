import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { site } from "@/lib/site";

declare module "next-auth" {
  interface Session {
    user: { role?: "admin" | "client" } & DefaultSession["user"];
  }
}

/**
 * Demo auth. Google works once AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are set.
 * Credentials: the demo admin below gets the admin role; any other valid
 * email + 6char password signs in as a client (demo/mock store).
 */
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
        if (!email || password.length < 6) return null;

        if (email === site.admin.demoEmail && password === site.admin.demoPassword) {
          return { id: "admin", name: "Kennel Admin", email, role: "admin" };
        }
        // Demo client login — any valid-looking email + 6+ char password
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          return {
            id: `client-${email}`,
            name: email.split("@")[0].replace(/[.]/g, " "),
            email,
            role: "client",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.role = (user as { role?: string }).role ?? "client";
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) session.user.role = (token.role as "admin" | "client") ?? "client";
      return session;
    },
  },
});
