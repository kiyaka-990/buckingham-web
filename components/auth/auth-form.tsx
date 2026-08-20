"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Loader2, User, ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";
import { Crest } from "@/components/brand/crest";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Method = "password" | "otp";
type Busy = "google" | "credentials" | "otp-send" | "otp-verify" | null;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState<Busy>(null);
  const [error, setError] = useState("");
  const [method, setMethod] = useState<Method>("password");

  // OTP flow state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);

  const isLogin = mode === "login";

  const finish = () => {
    router.push("/account");
    router.refresh();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading("credentials");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    // Create the account first when registering.
    if (!isLogin) {
      const reg = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email, password }),
      });
      if (!reg.ok) {
        const data = await reg.json().catch(() => ({}));
        setLoading(null);
        setError(data.error || "Could not create your account.");
        return;
      }
    }

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(null);
    if (res?.error) {
      setError(isLogin ? "Invalid email or password." : "Account created — please sign in.");
      return;
    }
    finish();
  };

  const sendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setDevCode(null);
    setLoading("otp-send");
    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not send a code. Please try again.");
        // Email delivery isn't wired up on this deployment — steer them to a
        // method that does work rather than leaving them stuck on this tab.
        if (data.unavailable) setMethod("password");
        return;
      }
      setOtpSent(true);
      if (data.devCode) setDevCode(data.devCode);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const verifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading("otp-verify");
    const res = await signIn("otp", { email: otpEmail, code: otpCode, redirect: false });
    setLoading(null);
    if (res?.error) {
      setError("That code isn't right, or it has expired. Ask for a new one.");
      return;
    }
    finish();
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center text-center">
          <Crest className="mb-3 h-14" />
          <h1 className="font-display text-2xl font-bold">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isLogin ? "Sign in to manage your reservations." : "Join the Buckingham family."}
          </p>
        </div>

        <button
          onClick={() => {
            setLoading("google");
            signIn("google", { callbackUrl: "/account" });
          }}
          disabled={loading !== null}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border font-medium transition hover:bg-foreground/5"
        >
          {loading === "google" ? <Loader2 className="animate-spin" size={18} /> : <GoogleG />}
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" /> or use your email{" "}
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Method switch */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-border p-1">
          {(
            [
              { key: "password", label: "Password", icon: <Lock size={14} /> },
              { key: "otp", label: "Email code", icon: <KeyRound size={14} /> },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setMethod(t.key);
                setError("");
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition",
                method === t.key ? "bg-clay-800 text-white" : "text-muted hover:text-foreground"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {method === "password" ? (
          <form onSubmit={onSubmit} className="space-y-3">
            {!isLogin && <IconInput icon={<User size={16} />} name="name" placeholder="Full name" />}
            <IconInput icon={<Mail size={16} />} name="email" type="email" placeholder="Email address" required />
            <IconInput
              icon={<Lock size={16} />}
              name="password"
              type="password"
              placeholder="Password (6+ characters)"
              required
              minLength={6}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button disabled={loading !== null} className="btn-clay flex h-12 w-full items-center justify-center gap-2 rounded-full">
              {loading === "credentials" ? (
                <Loader2 className="animate-spin" size={18} />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        ) : !otpSent ? (
          <form onSubmit={sendCode} className="space-y-3">
            <IconInput
              icon={<Mail size={16} />}
              type="email"
              placeholder="Email address"
              value={otpEmail}
              onChange={(e) => setOtpEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <p className="text-xs text-muted">
              We&apos;ll email you a six-digit code. No password to remember — and it creates your
              account if you don&apos;t have one yet.
            </p>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button disabled={loading !== null} className="btn-clay flex h-12 w-full items-center justify-center gap-2 rounded-full">
              {loading === "otp-send" ? <Loader2 className="animate-spin" size={18} /> : "Send me a code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtpCode("");
                setError("");
                setDevCode(null);
              }}
              className="flex items-center gap-1 text-xs text-muted transition hover:text-foreground"
            >
              <ArrowLeft size={13} /> Use a different email
            </button>

            <p className="text-sm text-muted">
              Code sent to <strong className="text-foreground">{otpEmail}</strong>. It expires in ten
              minutes.
            </p>

            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              aria-label="Six-digit sign-in code"
              className="h-14 w-full rounded-xl border border-border bg-background text-center font-display text-2xl tracking-[0.6em] outline-none focus:border-ochre-400"
            />

            {devCode && (
              <p className="rounded-xl border border-ochre-400/40 bg-ochre-400/10 px-3 py-2 text-xs text-muted">
                No mail provider configured, so here is the code for testing:{" "}
                <strong className="font-mono text-foreground">{devCode}</strong>
              </p>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              disabled={loading !== null || otpCode.length !== 6}
              className="btn-clay flex h-12 w-full items-center justify-center gap-2 rounded-full disabled:opacity-50"
            >
              {loading === "otp-verify" ? <Loader2 className="animate-spin" size={18} /> : "Verify & sign in"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-muted">
          {isLogin ? "New to Buckingham?" : "Already have an account?"}{" "}
          <Link href={isLogin ? "/register" : "/login"} className="font-medium text-accent-ink hover:underline">
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-border bg-surface-2/50 p-4 text-xs text-muted">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent-ink" />
        <span>
          <strong className="text-foreground">Three ways in:</strong> Google, a password, or a
          one-time code emailed to you. Admin demo: <code>{site.admin.demoEmail}</code> /{" "}
          <code>{site.admin.demoPassword}</code>
        </span>
      </div>
    </div>
  );
}

function IconInput({
  icon,
  ...props
}: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-ochre-400">
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
