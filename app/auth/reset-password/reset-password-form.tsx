"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const supabase = supabaseBrowser();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setMessage({ kind: "error", text: "Password must be at least 8 characters." });
      return;
    }
    start(async () => {
      setMessage(null);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return setMessage({ kind: "error", text: error.message });
      setMessage({ kind: "info", text: "Password updated. Redirecting..." });
      setTimeout(() => { router.push("/account"); router.refresh(); }, 1200);
    });
  }

  return (
    <form onSubmit={onSubmit} className="card p-8 space-y-4">
      <div>
        <label className="block text-xs font-medium text-fg-muted mb-2 uppercase tracking-wider">New password</label>
        <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border focus:border-accent outline-none transition"
          placeholder="8+ characters" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? "Saving..." : "Update password"}
      </button>
      {message && (
        <div className={`text-sm px-4 py-3 rounded-lg ${message.kind === "error" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-accent/10 text-accent border border-accent/20"}`}>
          {message.text}
        </div>
      )}
    </form>
  );
}
