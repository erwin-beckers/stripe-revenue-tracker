import { PRODUCT_ID } from "@/lib/supabase";
import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ConnectForm from "./connect-form";

export const metadata = { title: "Connect Stripe — Stripe Revenue Tracker" };

export default async function ConnectPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app/connect");

  // Require active subscription
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("product_id", PRODUCT_ID)
    .in("status", ["active", "trialing", "past_due"])
    .limit(1);
  if (!subs || subs.length === 0) redirect("/app");

  const { data: existing } = await supabase
    .from("stripe_connections")
    .select("stripe_account_id,stripe_account_name,last_synced_at")
    .eq("user_id", user.id)
    .eq("product_id", PRODUCT_ID)
    .maybeSingle();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link href="/app" className="text-sm text-fg-muted hover:text-fg inline-flex items-center gap-2 mb-8">
        <span>←</span> Back
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight text-gradient mb-2">Connect your Stripe account</h1>
      <p className="text-fg-muted mb-10">
        Paste a <strong>read-only restricted key</strong>. We never see your full Stripe key — we only query your data.
      </p>

      {existing && (
        <div className="card p-6 mb-6 border-accent/30">
          <p className="text-sm text-fg-muted mb-1">Currently connected to</p>
          <p className="font-medium">{existing.stripe_account_name || existing.stripe_account_id}</p>
          {existing.last_synced_at && (
            <p className="text-xs text-fg-subtle mt-2">
              Last synced {new Date(existing.last_synced_at).toLocaleString()}
            </p>
          )}
          <p className="text-sm text-fg-muted mt-4">
            Submitting a new key below will replace this connection.
          </p>
        </div>
      )}

      <ConnectForm />

      <div className="card p-6 mt-10 bg-bg-elevated/40">
        <h2 className="font-semibold mb-3">How to generate a read-only restricted key</h2>
        <ol className="text-sm text-fg-muted space-y-2 list-decimal list-inside leading-relaxed">
          <li>In Stripe, go to <a className="text-accent hover:text-accent-hover" href="https://dashboard.stripe.com/apikeys/create" target="_blank" rel="noopener">Developers → API keys → Create restricted key</a>.</li>
          <li>Give it a name (e.g. &quot;Stripe Revenue Tracker&quot;).</li>
          <li>Set these permissions to <strong>Read</strong>: Customers, Invoices, Subscriptions, Charges, Payment Intents, Account. Leave everything else as None.</li>
          <li>Click Create. Copy the key (starts with <code className="bg-bg-card px-1.5 py-0.5 rounded text-xs">rk_live_</code> or <code className="bg-bg-card px-1.5 py-0.5 rounded text-xs">rk_test_</code>).</li>
          <li>Paste it above. Stripe enforces the permissions — we cannot modify anything in your account even if we wanted to.</li>
        </ol>
      </div>
    </div>
  );
}
