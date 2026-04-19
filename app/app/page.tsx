import { supabaseServer, PRODUCT_ID } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Stripe Revenue Tracker" };

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

  const active = subs?.[0];

  if (!active) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-gradient mb-4">
          One step away
        </h1>
        <p className="text-fg-muted mb-10 leading-relaxed">
          Choose a plan to unlock Stripe Revenue Tracker. You can cancel anytime from your account.
        </p>
        <Link href="/#pricing" className="btn-primary">Choose a plan</Link>
        <p className="mt-10 text-sm">
          <Link href="/account" className="text-fg-muted hover:text-fg">Go to account →</Link>
        </p>
      </div>
    );
  }

  // TODO: this is where the actual product UI goes. Per-product code will live here.
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to Stripe Revenue Tracker</h1>
          <p className="text-fg-muted mt-1">Signed in as {user.email} · {active.tier} plan</p>
        </div>
        <Link href="/account" className="text-sm text-fg-muted hover:text-fg">Account →</Link>
      </div>

      <div className="card p-10 text-center">
        <p className="text-fg-muted leading-relaxed max-w-xl mx-auto">
          The product workspace lives here. Per-product functionality is added on top of this shell
          (for Stripe Revenue Tracker this is where your dashboard will be).
        </p>
      </div>
    </div>
  );
}
