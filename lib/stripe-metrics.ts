/**
 * Stripe metrics engine — takes a read-only API key, returns normalized metrics.
 *
 * Design:
 *   - One Stripe instance per call (fresh — keys don't rotate often enough to pool)
 *   - Pulls subscriptions, recent invoices, failed payment_intents, customers
 *   - Normalizes annual plans → monthly for MRR
 *   - Excludes trialing subs from revenue (but counts them as future MRR)
 *
 * The Stripe SDK handles pagination via auto-pagination; we use it where available.
 */
import "server-only";
import Stripe from "stripe";

export type Metrics = {
  mrr_cents: number;                  // active + past_due MRR in USD-equivalent cents
  future_mrr_cents: number;           // trialing MRR (will become MRR when trials convert)
  active_subscribers: number;
  trialing_subscribers: number;
  past_due_subscribers: number;
  currency: string;                   // dominant currency detected on the account
  // Lists
  failed_payments: FailedPayment[];
  recent_churn: ChurnedSubscription[];
  recent_new_subs: NewSubscription[];
  // Snapshot of current subs grouped by plan
  by_plan: Array<{ plan: string; count: number; mrr_cents: number }>;
  // Meta
  account_id: string;
  account_name: string | null;
  as_of: string;                      // ISO timestamp
};

export type FailedPayment = {
  customer_email: string | null;
  customer_name: string | null;
  amount_cents: number;
  currency: string;
  last_attempt_at: string;
  next_attempt_at: string | null;
  subscription_id: string | null;
  failure_reason: string | null;
};

export type ChurnedSubscription = {
  customer_email: string | null;
  customer_name: string | null;
  plan: string;
  mrr_cents: number;
  cancellation_reason: string | null;
  canceled_at: string;
  tenure_days: number;
};

export type NewSubscription = {
  customer_email: string | null;
  customer_name: string | null;
  plan: string;
  mrr_cents: number;
  started_at: string;
  is_trial: boolean;
};

/** Normalize a Stripe subscription item to monthly revenue in cents. */
function itemToMonthlyCents(item: Stripe.SubscriptionItem): number {
  const price = item.price;
  if (!price) return 0;
  const unit = price.unit_amount ?? 0;
  const qty = item.quantity ?? 1;
  const total = unit * qty;
  const recurring = price.recurring;
  if (!recurring) return 0;
  // Normalize to months
  const interval = recurring.interval;
  const count = recurring.interval_count || 1;
  let monthly = 0;
  switch (interval) {
    case "day":   monthly = (total * 30) / count; break;
    case "week":  monthly = (total * 30 / 7) / count; break;
    case "month": monthly = total / count; break;
    case "year":  monthly = total / (count * 12); break;
    default: monthly = 0;
  }
  return Math.round(monthly);
}

function subscriptionToMRR(sub: Stripe.Subscription): number {
  // Apply discount if present (simple percent_off — skip amount_off complexity)
  const baseMonthly = (sub.items?.data ?? []).reduce((sum, it) => sum + itemToMonthlyCents(it), 0);
  const discount: any = (sub as any).discount;
  if (discount?.coupon?.percent_off) {
    return Math.round(baseMonthly * (1 - discount.coupon.percent_off / 100));
  }
  return baseMonthly;
}

function describePlan(sub: Stripe.Subscription): string {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  if (!price) return "unknown";
  // product is NOT expanded here (Stripe's 4-level expansion cap); falls back to nickname/id.
  const nickname = price.nickname || (typeof price.product === "object" ? (price.product as any)?.name : null) || price.id;
  const interval = price.recurring?.interval || "once";
  return `${nickname} / ${interval}`;
}

async function fetchAllSubscriptions(client: Stripe): Promise<Stripe.Subscription[]> {
  // Stripe caps expansion at 4 levels deep — data.items.data.price is the max.
  // We skip expanding price.product; describePlan() falls back to price.nickname / id.
  const out: Stripe.Subscription[] = [];
  for await (const s of client.subscriptions.list({
    limit: 100,
    status: "all",
    expand: ["data.customer", "data.discount"],
  })) {
    out.push(s);
  }
  return out;
}

async function fetchRecentInvoices(client: Stripe, sinceDaysAgo: number): Promise<Stripe.Invoice[]> {
  const since = Math.floor(Date.now() / 1000) - sinceDaysAgo * 86400;
  const out: Stripe.Invoice[] = [];
  for await (const inv of client.invoices.list({
    limit: 100,
    created: { gte: since },
    expand: ["data.customer"],
  })) {
    out.push(inv);
  }
  return out;
}

function custEmail(c: Stripe.Customer | string | null | undefined): string | null {
  if (!c || typeof c === "string") return null;
  return (c as Stripe.Customer).email ?? null;
}

function custName(c: Stripe.Customer | string | null | undefined): string | null {
  if (!c || typeof c === "string") return null;
  return (c as Stripe.Customer).name ?? null;
}

export async function fetchMetrics(stripeKey: string): Promise<Metrics> {
  const client = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" as any });

  // Account info (works with restricted keys if the perm is enabled)
  let accountId = "unknown";
  let accountName: string | null = null;
  try {
    const acct = await client.accounts.retrieve();
    accountId = acct.id;
    accountName = acct.settings?.dashboard?.display_name || acct.business_profile?.name || acct.email || null;
  } catch {
    // Restricted keys may not have account:read. Not fatal.
  }

  const [subs, invoices] = await Promise.all([
    fetchAllSubscriptions(client),
    fetchRecentInvoices(client, 30),
  ]);

  // Bucket subs
  const active: Stripe.Subscription[] = [];
  const trialing: Stripe.Subscription[] = [];
  const pastDue: Stripe.Subscription[] = [];
  const canceledRecent: Stripe.Subscription[] = [];
  const newSubs: Stripe.Subscription[] = [];
  const thirtyDaysAgo = Date.now() / 1000 - 30 * 86400;

  let currency = "usd";
  const currencyCounts: Record<string, number> = {};

  for (const s of subs) {
    const c = (s.items?.data?.[0]?.price?.currency) || "usd";
    currencyCounts[c] = (currencyCounts[c] ?? 0) + 1;

    if (s.status === "active") active.push(s);
    else if (s.status === "trialing") trialing.push(s);
    else if (s.status === "past_due") pastDue.push(s);
    else if (s.status === "canceled" && s.canceled_at && s.canceled_at >= thirtyDaysAgo) {
      canceledRecent.push(s);
    }
    if (s.created >= thirtyDaysAgo && ["active", "trialing", "past_due"].includes(s.status)) {
      newSubs.push(s);
    }
  }
  currency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "usd";

  const mrr_cents = [...active, ...pastDue].reduce((sum, s) => sum + subscriptionToMRR(s), 0);
  const future_mrr_cents = trialing.reduce((sum, s) => sum + subscriptionToMRR(s), 0);

  // By-plan breakdown (active only)
  const planBuckets = new Map<string, { count: number; mrr_cents: number }>();
  for (const s of active) {
    const plan = describePlan(s);
    const b = planBuckets.get(plan) ?? { count: 0, mrr_cents: 0 };
    b.count += 1;
    b.mrr_cents += subscriptionToMRR(s);
    planBuckets.set(plan, b);
  }
  const by_plan = Array.from(planBuckets.entries())
    .map(([plan, v]) => ({ plan, ...v }))
    .sort((a, b) => b.mrr_cents - a.mrr_cents);

  // Failed payments — from past_due subs and from recent failed invoices
  const failed_payments: FailedPayment[] = [];
  for (const inv of invoices) {
    if (inv.status !== "open" && inv.attempt_count === 0) continue;
    if (inv.status === "paid" || inv.status === "void" || inv.status === "draft") continue;
    if (!inv.attempt_count || inv.attempt_count === 0) continue;
    const c = inv.customer as any;
    failed_payments.push({
      customer_email: custEmail(c),
      customer_name: custName(c),
      amount_cents: inv.amount_due ?? 0,
      currency: inv.currency ?? currency,
      last_attempt_at: new Date((inv.status_transitions?.finalized_at ?? inv.created) * 1000).toISOString(),
      next_attempt_at: inv.next_payment_attempt ? new Date(inv.next_payment_attempt * 1000).toISOString() : null,
      subscription_id: typeof inv.subscription === "string" ? inv.subscription : (inv.subscription as any)?.id ?? null,
      failure_reason: (inv as any).last_finalization_error?.message ?? null,
    });
  }

  // Recent churn
  const recent_churn: ChurnedSubscription[] = canceledRecent.map(s => {
    const c = s.customer as any;
    const canceledAt = s.canceled_at ? new Date(s.canceled_at * 1000) : new Date();
    const tenureDays = s.canceled_at && s.start_date
      ? Math.round((s.canceled_at - s.start_date) / 86400)
      : 0;
    return {
      customer_email: custEmail(c),
      customer_name: custName(c),
      plan: describePlan(s),
      mrr_cents: subscriptionToMRR(s),
      cancellation_reason: (s as any).cancellation_details?.reason ?? (s as any).cancellation_details?.feedback ?? null,
      canceled_at: canceledAt.toISOString(),
      tenure_days: tenureDays,
    };
  }).sort((a, b) => b.canceled_at.localeCompare(a.canceled_at));

  // New subs
  const recent_new_subs: NewSubscription[] = newSubs.map(s => {
    const c = s.customer as any;
    return {
      customer_email: custEmail(c),
      customer_name: custName(c),
      plan: describePlan(s),
      mrr_cents: subscriptionToMRR(s),
      started_at: new Date(s.created * 1000).toISOString(),
      is_trial: s.status === "trialing",
    };
  }).sort((a, b) => b.started_at.localeCompare(a.started_at));

  return {
    mrr_cents,
    future_mrr_cents,
    active_subscribers: active.length,
    trialing_subscribers: trialing.length,
    past_due_subscribers: pastDue.length,
    currency,
    failed_payments: failed_payments.slice(0, 20),
    recent_churn: recent_churn.slice(0, 20),
    recent_new_subs: recent_new_subs.slice(0, 20),
    by_plan,
    account_id: accountId,
    account_name: accountName,
    as_of: new Date().toISOString(),
  };
}

/** Validate a Stripe key by making a lightweight authenticated request. */
export async function validateStripeKey(key: string): Promise<{ ok: boolean; account_id?: string; account_name?: string | null; error?: string }> {
  if (!key || !/^(rk|sk)_(live|test)_/.test(key)) {
    return { ok: false, error: "Key must start with rk_live_, rk_test_, sk_live_, or sk_test_." };
  }
  try {
    const client = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
    const acct = await client.accounts.retrieve();
    return {
      ok: true,
      account_id: acct.id,
      account_name: acct.settings?.dashboard?.display_name || acct.business_profile?.name || acct.email || null,
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Stripe rejected the key." };
  }
}

export function formatMoney(cents: number, currency = "usd"): string {
  const amt = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amt);
}
