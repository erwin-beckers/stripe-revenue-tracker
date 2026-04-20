import { NextResponse, type NextRequest } from "next/server";
import { PRODUCT_ID } from "@/lib/supabase";
import { supabaseServer } from "@/lib/supabase-server";
import { encryptSecret } from "@/lib/crypto";
import { validateStripeKey } from "@/lib/stripe-metrics";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  // Confirm active subscription
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("product_id", PRODUCT_ID)
    .in("status", ["active", "trialing", "past_due"])
    .limit(1);
  if (!subs || subs.length === 0) {
    return NextResponse.json({ error: "no active subscription" }, { status: 402 });
  }

  const body = await req.json().catch(() => null);
  const stripeKey = String(body?.stripe_key ?? "").trim();
  if (!stripeKey) return NextResponse.json({ error: "stripe_key required" }, { status: 400 });

  const check = await validateStripeKey(stripeKey);
  if (!check.ok) {
    return NextResponse.json({ error: check.error || "invalid key" }, { status: 400 });
  }

  const encrypted = encryptSecret(stripeKey);

  // Upsert by (user_id, product_id) — enforced by the unique index from the migration
  const { error } = await supabase
    .from("stripe_connections")
    .upsert({
      user_id: user.id,
      product_id: PRODUCT_ID,
      stripe_key_encrypted: encrypted,
      stripe_account_id: check.account_id ?? null,
      stripe_account_name: check.account_name ?? null,
      last_synced_at: null,
    }, { onConflict: "user_id,product_id" });

  if (error) {
    console.error("stripe connect upsert error", error);
    return NextResponse.json({ error: "could not save connection" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    account_id: check.account_id,
    account_name: check.account_name,
  });
}
