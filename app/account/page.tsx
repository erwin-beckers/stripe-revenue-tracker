import { supabaseServer, PRODUCT_ID } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Account — Stripe Revenue Tracker" };

type Sub = {
  tier: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  polar_subscription_id: string;
  polar_customer_portal_url: string | null;
};

function prettyStatus(s: string): { label: string; color: string } {
  switch (s) {
    case "active":   return { label: "Active",   color: "text-accent" };
    case "trialing": return { label: "On trial", color: "text-accent" };
    case "past_due": return { label: "Past due", color: "text-yellow-400" };
    case "canceled": return { label: "Canceled", color: "text-red-400" };
    default:         return { label: s,          color: "text-fg-muted" };
  }
}

export default async function AccountPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("tier,status,current_period_end,cancel_at_period_end,polar_subscription_id,polar_customer_portal_url")
    .eq("user_id", user.id)
    .eq("product_id", PRODUCT_ID)
    .order("created_at", { ascending: false });

  const active = (subs as Sub[] | null)?.find(s => ["active", "trialing", "past_due"].includes(s.status));
  const status = active ? prettyStatus(active.status) : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-gradient mb-2">Your account</h1>
      <p className="text-fg-muted mb-10">{user.email}</p>

      <div className="card p-8 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Subscription</h2>
          {status && (
            <span className={`text-sm font-medium ${status.color}`}>● {status.label}</span>
          )}
        </div>

        {active ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-fg-muted">Plan</span>
              <span className="font-medium capitalize">{active.tier}</span>
            </div>
            {active.current_period_end && (
              <div className="flex justify-between text-sm">
                <span className="text-fg-muted">
                  {active.cancel_at_period_end ? "Ends on" : "Renews on"}
                </span>
                <span>{new Date(active.current_period_end).toLocaleDateString()}</span>
              </div>
            )}
            {active.cancel_at_period_end && (
              <p className="text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                Your subscription is set to cancel at the end of the period. You&apos;ll keep access until then.
              </p>
            )}
            {active.polar_customer_portal_url ? (
              <a href={active.polar_customer_portal_url} target="_blank" rel="noopener noreferrer"
                className="btn-primary w-full justify-center flex mt-2">
                Manage billing & invoices
              </a>
            ) : (
              <p className="text-xs text-fg-subtle">Billing portal link will appear here shortly after purchase.</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-fg-muted mb-5">You don&apos;t have an active subscription.</p>
            <Link href="/#pricing" className="btn-primary">Choose a plan</Link>
          </div>
        )}
      </div>

      <div className="card p-8 mb-6">
        <h2 className="text-xl font-semibold mb-5">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-fg-muted">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-fg-muted">Member since</span>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <a href="/auth/forgot-password"
          className="text-sm text-accent hover:text-accent-hover mt-5 inline-block">
          Change password →
        </a>
      </div>

      <div className="flex justify-between items-center pt-4">
        {active ? (
          <Link href="/app" className="btn-primary">Open Stripe Revenue Tracker</Link>
        ) : <span />}
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm text-fg-muted hover:text-fg transition">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
