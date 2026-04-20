import { PRODUCT_ID } from "@/lib/supabase";
import { supabaseServer } from "@/lib/supabase-server";
import { decryptSecret } from "@/lib/crypto";
import { fetchMetrics, formatMoney, type Metrics } from "@/lib/stripe-metrics";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Stripe Revenue Tracker" };
export const dynamic = "force-dynamic";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

async function loadMetrics(keyPayload: string): Promise<{ metrics?: Metrics; error?: string }> {
  try {
    const key = decryptSecret(keyPayload);
    const metrics = await fetchMetrics(key);
    return { metrics };
  } catch (e: any) {
    return { error: e?.message || "Failed to fetch from Stripe" };
  }
}

export default async function AppPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("tier,status")
    .eq("user_id", user.id)
    .eq("product_id", PRODUCT_ID)
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1);

  const activeSub = subs?.[0];

  if (!activeSub) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-gradient mb-4">One step away</h1>
        <p className="text-fg-muted mb-10 leading-relaxed">
          Choose a plan to unlock Stripe Revenue Tracker. Cancel anytime from your account.
        </p>
        <Link href="/#pricing" className="btn-primary">Choose a plan</Link>
        <p className="mt-10 text-sm">
          <Link href="/account" className="text-fg-muted hover:text-fg">Go to account →</Link>
        </p>
      </div>
    );
  }

  // Do we have a Stripe connection?
  const { data: conn } = await supabase
    .from("stripe_connections")
    .select("stripe_key_encrypted,stripe_account_id,stripe_account_name,last_synced_at")
    .eq("user_id", user.id)
    .eq("product_id", PRODUCT_ID)
    .maybeSingle();

  if (!conn) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-gradient mb-4">Connect Stripe to get started</h1>
        <p className="text-fg-muted mb-10 leading-relaxed">
          Paste a read-only restricted API key and see your real MRR, churn, and failed payments within 30 seconds.
        </p>
        <Link href="/app/connect" className="btn-primary">Connect Stripe</Link>
      </div>
    );
  }

  const { metrics, error } = await loadMetrics(conn.stripe_key_encrypted);

  if (error || !metrics) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="card p-8 border-red-500/30">
          <h1 className="text-2xl font-semibold mb-3">Couldn&apos;t reach Stripe</h1>
          <pre className="text-sm text-fg-muted mb-6 whitespace-pre-wrap bg-bg-elevated/40 p-4 rounded-lg border border-border">
            {error}
          </pre>
          <p className="text-sm text-fg-subtle mb-6">
            Check that your restricted key is still active and has read scope on Customers,
            Invoices, Subscriptions, Charges, Payment Intents, and Account.
          </p>
          <Link href="/app/connect" className="btn-primary">Reconnect Stripe</Link>
        </div>
      </div>
    );
  }

  // Update last_synced_at (fire-and-forget)
  void supabase
    .from("stripe_connections")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("product_id", PRODUCT_ID);

  const cur = metrics.currency;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-sm text-fg-muted mb-1">
            {metrics.account_name || metrics.account_id}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Revenue overview</h1>
          <p className="text-sm text-fg-subtle mt-2">
            Synced {timeAgo(metrics.as_of)} · <Link href="/app/connect" className="hover:text-fg">Reconnect</Link>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/account" className="btn-secondary !text-sm">Account</Link>
          <form action="" method="get">
            <button className="btn-primary !text-sm" type="submit">Refresh</button>
          </form>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <MetricCard label="MRR" value={formatMoney(metrics.mrr_cents, cur)}
          hint={`${metrics.active_subscribers} active`} />
        <MetricCard label="Trial MRR" value={formatMoney(metrics.future_mrr_cents, cur)}
          hint={`${metrics.trialing_subscribers} trialing`} tone="accent" />
        <MetricCard label="At risk"
          value={formatMoney(
            metrics.failed_payments.reduce((s, p) => s + p.amount_cents, 0),
            cur)}
          hint={`${metrics.past_due_subscribers} past due`} tone="warning" />
        <MetricCard label="New (30d)"
          value={String(metrics.recent_new_subs.length)}
          hint="signups" />
      </div>

      {/* Two-col lists */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Failed payments */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Failed payments</h2>
            <span className="text-xs text-fg-subtle">{metrics.failed_payments.length} open</span>
          </div>
          {metrics.failed_payments.length === 0 ? (
            <p className="text-sm text-fg-muted py-4">No open failures. Nice.</p>
          ) : (
            <ul className="divide-y divide-border">
              {metrics.failed_payments.map((p, i) => (
                <li key={i} className="py-3 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {p.customer_name || p.customer_email || "Unknown"}
                    </p>
                    {p.customer_email && p.customer_name && (
                      <p className="text-xs text-fg-subtle truncate">{p.customer_email}</p>
                    )}
                    {p.next_attempt_at && (
                      <p className="text-xs text-fg-subtle mt-0.5">
                        next retry {new Date(p.next_attempt_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-yellow-400 flex-shrink-0">
                    {formatMoney(p.amount_cents, p.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent churn */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Recent churn (30d)</h2>
            <span className="text-xs text-fg-subtle">
              -{formatMoney(
                metrics.recent_churn.reduce((s, c) => s + c.mrr_cents, 0), cur
              )} MRR
            </span>
          </div>
          {metrics.recent_churn.length === 0 ? (
            <p className="text-sm text-fg-muted py-4">No cancellations in the last 30 days.</p>
          ) : (
            <ul className="divide-y divide-border">
              {metrics.recent_churn.map((c, i) => (
                <li key={i} className="py-3 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {c.customer_name || c.customer_email || "Unknown"}
                    </p>
                    <p className="text-xs text-fg-subtle mt-0.5 truncate">
                      {c.plan} · {c.tenure_days}d tenure
                    </p>
                    {c.cancellation_reason && (
                      <p className="text-xs text-fg-subtle mt-0.5">
                        &ldquo;{c.cancellation_reason}&rdquo;
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-red-400 flex-shrink-0">
                    -{formatMoney(c.mrr_cents, cur)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* By plan */}
        <section className="card p-6">
          <h2 className="font-semibold mb-5">Active plans</h2>
          {metrics.by_plan.length === 0 ? (
            <p className="text-sm text-fg-muted py-4">No active subscriptions.</p>
          ) : (
            <ul className="space-y-3">
              {metrics.by_plan.map((p, i) => (
                <li key={i} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{p.plan}</p>
                    <p className="text-xs text-fg-subtle">{p.count} customers</p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatMoney(p.mrr_cents, cur)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* New subs */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">New (30d)</h2>
            <span className="text-xs text-fg-subtle">
              +{formatMoney(
                metrics.recent_new_subs.reduce((s, n) => s + n.mrr_cents, 0), cur
              )}
            </span>
          </div>
          {metrics.recent_new_subs.length === 0 ? (
            <p className="text-sm text-fg-muted py-4">No new subscriptions in the last 30 days.</p>
          ) : (
            <ul className="divide-y divide-border">
              {metrics.recent_new_subs.slice(0, 10).map((n, i) => (
                <li key={i} className="py-3 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {n.customer_name || n.customer_email || "Unknown"}
                    </p>
                    <p className="text-xs text-fg-subtle mt-0.5 truncate">
                      {n.plan} {n.is_trial && <span className="text-accent">· trial</span>}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-accent flex-shrink-0">
                    +{formatMoney(n.mrr_cents, cur)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint, tone }: {
  label: string;
  value: string;
  hint?: string;
  tone?: "accent" | "warning";
}) {
  const valueClass =
    tone === "warning" ? "text-yellow-400" :
    tone === "accent"  ? "text-accent" :
    "text-fg";
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wider text-fg-subtle mb-2">{label}</p>
      <p className={`text-2xl md:text-3xl font-semibold ${valueClass}`}>{value}</p>
      {hint && <p className="text-xs text-fg-subtle mt-1">{hint}</p>}
    </div>
  );
}
