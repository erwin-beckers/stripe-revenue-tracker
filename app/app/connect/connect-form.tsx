"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ConnectForm() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      setMessage(null);
      const r = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stripe_key: key.trim() }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMessage({ kind: "error", text: body.error || `Failed (${r.status})` });
        return;
      }
      setMessage({ kind: "info", text: `Connected to ${body.account_name || body.account_id}` });
      setTimeout(() => { router.push("/app"); router.refresh(); }, 800);
    });
  }

  return (
    <form onSubmit={onSubmit} className="card p-8 space-y-5">
      <div>
        <label className="block text-xs font-medium text-fg-muted mb-2 uppercase tracking-wider">
          Restricted API key
        </label>
        <input
          type="password"
          required
          value={key}
          onChange={e => setKey(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border focus:border-accent outline-none transition font-mono text-sm"
          placeholder="rk_live_… or rk_test_…"
        />
        <p className="text-xs text-fg-subtle mt-2">
          Must start with <code>rk_</code> or <code>sk_</code>. We encrypt it at rest with AES-256.
        </p>
      </div>
      <button type="submit" disabled={pending} className="btn-primary w-full justify-center">
        {pending ? "Verifying with Stripe..." : "Connect"}
      </button>
      {message && (
        <div className={`text-sm px-4 py-3 rounded-lg ${message.kind === "error" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-accent/10 text-accent border border-accent/20"}`}>
          {message.text}
        </div>
      )}
    </form>
  );
}
