"use client";

import { useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const supabase = supabaseBrowser();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      setMessage(null);
      const redirectTo = typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset-password`
        : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return setMessage({ kind: "error", text: error.message });
      setMessage({ kind: "info", text: `Link sent. Check ${email}.` });
    });
  }

  return (
    <form onSubmit={onSubmit} className="card p-8 space-y-4">
      <div>
        <label className="block text-xs font-medium text-fg-muted mb-2 uppercase tracking-wider">Email</label>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border focus:border-accent outline-none transition"
          placeholder="you@example.com" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? "Sending..." : "Send reset link"}
      </button>
      {message && (
        <div className={`text-sm px-4 py-3 rounded-lg ${message.kind === "error" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-accent/10 text-accent border border-accent/20"}`}>
          {message.text}
        </div>
      )}
      <p className="text-center text-sm text-fg-muted pt-1">
        <a href="/login" className="text-accent hover:text-accent-hover">Back to sign in</a>
      </p>
    </form>
  );
}
