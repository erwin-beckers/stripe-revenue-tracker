/**
 * Polar webhook — receives subscription.* and checkout.* events, syncs state to Supabase.
 *
 * Setup (handled by factory/scripts/provision_polar.py):
 *   1. Webhook URL: https://<site>/api/polar/webhook
 *   2. Events: checkout.created, checkout.updated, subscription.created,
 *              subscription.updated, subscription.canceled, subscription.active,
 *              subscription.revoked
 *   3. Secret stored in POLAR_WEBHOOK_SECRET env var.
 *
 * Polar uses standard Webhooks (webhooks.fyi) signatures — HMAC-SHA256 with timestamp.
 */
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { PRODUCT_ID } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

function verifySignature(
  payload: string,
  webhookId: string | null,
  webhookTimestamp: string | null,
  webhookSignature: string | null,
  secret: string,
): boolean {
  if (!webhookId || !webhookTimestamp || !webhookSignature) return false;

  // webhookSignature format: "v1,<base64>"  (may have multiple versions space-separated)
  const signedContent = `${webhookId}.${webhookTimestamp}.${payload}`;
  // Polar stores the secret base64-encoded when generated; try raw then base64-decoded
  const secrets = [secret];
  try { secrets.push(Buffer.from(secret, "base64").toString("binary")); } catch {}

  for (const s of secrets) {
    const computed = crypto.createHmac("sha256", s).update(signedContent).digest("base64");
    const expected = `v1,${computed}`;
    for (const sig of webhookSignature.split(" ")) {
      if (sig === expected || sig === computed) return true;
    }
  }
  return false;
}

async function upsertSubscription(sub: any, requestUrl: string) {
  const admin = supabaseAdmin();
  const email = sub?.customer?.email || sub?.customer_email || sub?.user?.email;
  if (!email) {
    console.warn("polar webhook: no email on subscription", sub?.id);
    return;
  }

  // Find or create the Supabase auth user by email
  const { data: listed } = await admin.auth.admin.listUsers();
  let userId = listed?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())?.id;
  const isNewUser = !userId;

  if (!userId) {
    // Create the user (no password yet — they'll set one via magic link / reset flow)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createErr || !created?.user) {
      console.error("polar webhook: createUser failed", createErr);
      return;
    }
    userId = created.user.id;
  }

  // Send magic-link email so the user can log in.
  // signInWithOtp actually dispatches the email (unlike admin.generateLink which only generates).
  // We send this for both new users AND existing users on new purchase, so the email acts as
  // a "welcome / start using it" CTA.
  if (isNewUser) {
    const origin = new URL(requestUrl).origin;
    const { error: otpErr } = await admin.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/app`,
        shouldCreateUser: false, // user already exists (we just made them)
      },
    });
    if (otpErr) console.warn("polar webhook: signInWithOtp failed", otpErr.message);
  }

  const record = {
    user_id: userId,
    email,
    product_id: PRODUCT_ID,
    polar_subscription_id: sub.id,
    polar_product_id: sub.product_id ?? sub.product?.id ?? "",
    tier: sub.product?.name?.split("–").pop()?.trim().toLowerCase() ?? "default",
    status: sub.status ?? "active",
    current_period_end: sub.current_period_end ?? null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    polar_customer_portal_url: sub.customer?.customer_portal_url ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("subscriptions")
    .upsert(record, { onConflict: "polar_subscription_id" });
  if (error) console.error("polar webhook: upsert failed", error);
}

export async function POST(req: NextRequest) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("polar webhook: POLAR_WEBHOOK_SECRET not set, accepting without verify (DEV ONLY)");
  }

  const body = await req.text();
  const id  = req.headers.get("webhook-id");
  const ts  = req.headers.get("webhook-timestamp");
  const sig = req.headers.get("webhook-signature");

  if (secret && !verifySignature(body, id, ts, sig, secret)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  let event: any;
  try { event = JSON.parse(body); }
  catch { return new NextResponse("bad json", { status: 400 }); }

  const type: string = event?.type ?? "";
  const data: any = event?.data ?? event;

  try {
    if (type.startsWith("subscription.")) {
      await upsertSubscription(data, req.url);
    } else if (type.startsWith("checkout.") && data?.subscription) {
      await upsertSubscription(data.subscription, req.url);
    }
  } catch (e) {
    console.error("polar webhook: handler error", e);
    return new NextResponse("handler error", { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
