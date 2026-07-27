"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Loader2, User, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"google" | "credentials" | null>(null);
  const [error, setError] = useState("");
  const isLogin = mode === "login";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading("credentials");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoading(null);
    if (res?.error) {
      setError("Invalid credentials. Password must be at least 6 characters.");
      return;
    }
    router.push("/account");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/brand/logo.png" alt={site.name} width={56} height={56} className="mb-3 h-14 w-14 rounded-full ring-1 ring-gold-400/40" />
          <h1 className="font-display text-2xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-muted">{isLogin ? "Sign in to manage your reservations." : "Join the Buckingham family."}</p>
        </div>

        <button
          onClick={() => { setLoading("google"); signIn("google", { callbackUrl: "/account" }); }}
          disabled={loading !== null}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border font-medium transition hover:bg-foreground/5"
        >
          {loading === "google" ? <Loader2 className="animate-spin" size={18} /> : <GoogleG />}
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" /> or {isLogin ? "sign in" : "sign up"} with email <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {!isLogin && (
            <IconInput icon={<User size={16} />} name="name" placeholder="Full name" />
          )}
          <IconInput icon={<Mail size={16} />} name="email" type="email" placeholder="Email address" required />
          <IconInput icon={<Lock size={16} />} name="password" type="password" placeholder="Password (6+ characters)" required />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button disabled={loading !== null} className="btn-gold flex h-12 w-full items-center justify-center gap-2 rounded-full">
            {loading === "credentials" ? <Loader2 className="animate-spin" size={18} /> : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {isLogin ? "New to Buckingham?" : "Already have an account?"}{" "}
          <Link href={isLogin ? "/register" : "/login"} className="font-medium text-gold-500 hover:underline">
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-border bg-surface-2/50 p-4 text-xs text-muted">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gold-500" />
        <span>
          <strong className="text-foreground">Demo access:</strong> any email + 6-char password works as a client.
          Admin dashboard: <code>{site.admin.demoEmail}</code> / <code>{site.admin.demoPassword}</code>
        </span>
      </div>
    </div>
  );
}

function IconInput({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-gold-400">
      <span className="text-muted">{icon}</span>
      <input {...props} className="h-12 flex-1 bg-transparent text-sm outline-none" />
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 8.1 29.3 6 24 6 14.1 6 6 14.1 6 24s8.1 18 18 18 18-8.1 18-18c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M8.3 14.7l6.6 4.8C16.7 16 20 14 24 14c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 8.1 29.3 6 24 6 16.3 6 9.7 10.3 8.3 14.7z" />
      <path fill="#4CAF50" d="M24 42c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 37.6 16.2 42 24 42z" />
      <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.3 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
