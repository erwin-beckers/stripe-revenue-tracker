"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

function providersFromEnv(): { google: boolean; github: boolean } {
  const list = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "google,magic_link,password")
    .split(",").map(s => s.trim());
  return { google: list.includes("google"), github: list.includes("github") };
}

export default function SignupForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const prefilledEmail = params.get("email") || "";

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [pending, start] = useTransition();

  const providers = providersFromEnv();
  const supabase = supabaseBrowser();

  function redirectTo(): string {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  function onOAuth(provider: "google" | "github") {
    start(async () => {
      setMessage(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectTo() },
      });
      if (error) setMessage({ kind: "error", text: error.message });
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      setMessage(null);
      if (!password) {
        // No password → magic link signup
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo(), shouldCreateUser: true },
        });
        if (error) return setMessage({ kind: "error", text: error.message });
        setMessage({ kind: "info", text: `We sent a confirmation link to ${email}.` });
        return;
      }
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: redirectTo() },
      });
      if (error) return setMessage({ kind: "error", text: error.message });
      setMessage({ kind: "info", text: `Check ${email} to confirm your account.` });
    });
  }

  return (
    <div className="card p-8 space-y-5">
      {(providers.google || providers.github) && (
        <div className="space-y-3">
          {providers.google && (
            <button type="button" onClick={() => onOAuth("google")} disabled={pending}
              className="btn-secondary w-full justify-center flex gap-3">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.3-7.2 2.3-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2c-.4.4 6.5-4.7 6.5-14.7 0-1.3-.1-2.6-.4-3.9z"/></svg>
              Sign up with Google
            </button>
          )}
          {providers.github && (
            <button type="button" onClick={() => onOAuth("github")} disabled={pending}
              className="btn-secondary w-full justify-center flex gap-3">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
              Sign up with GitHub
            </button>
          )}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-fg-subtle uppercase tracking-wider">or with email</span>
            <div className="h-px bg-border flex-1" />
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-2 uppercase tracking-wider">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border focus:border-accent outline-none transition"
            placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-fg-muted mb-2 uppercase tracking-wider">Password <span className="text-fg-subtle normal-case tracking-normal">(optional — leave blank to sign in with a link)</span></label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8}
            className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border focus:border-accent outline-none transition"
            placeholder="8+ characters" />
        </div>

        <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
          {pending ? "Working..." : password ? "Create account" : "Email me a link"}
        </button>
      </form>

      {message && (
        <div className={`text-sm px-4 py-3 rounded-lg ${message.kind === "error" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-accent/10 text-accent border border-accent/20"}`}>
          {message.text}
        </div>
      )}

      <p className="text-center text-sm text-fg-muted pt-2">
        Already have an account? <a href="/login" className="text-accent hover:text-accent-hover">Sign in</a>
      </p>
    </div>
  );
}
