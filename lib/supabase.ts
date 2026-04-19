/**
 * Supabase client factories — browser, server, and middleware variants.
 *
 * All factory products share ONE Supabase project. Each product is keyed by PRODUCT_ID
 * (set via NEXT_PUBLIC_PRODUCT_ID env var) so tables that store per-product data can
 * filter with RLS policies on product_id.
 */
import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export const PRODUCT_ID = process.env.NEXT_PUBLIC_PRODUCT_ID ?? "unknown";

function env(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

/** Client-side: use in Client Components and browser code. */
export function supabaseBrowser() {
  return createBrowserClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}

/** Server-side: use in Server Components, Route Handlers, Server Actions. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (all) => {
          try {
            all.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Called from Server Component; cookies are read-only. Middleware refreshes sessions.
          }
        },
      },
    },
  );
}

/** Middleware variant — uses request/response cookies. */
export function supabaseMiddleware(req: NextRequest, res: NextResponse) {
  return createServerClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (all) => {
          all.forEach(({ name, value }) => req.cookies.set(name, value));
          all.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options as CookieOptions));
        },
      },
    },
  );
}

/** Service-role client — bypasses RLS. Use ONLY in API routes / webhooks, never client-side. */
export function supabaseAdmin() {
  const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
