/**
 * Server-only Supabase clients. Import from `@/lib/supabase-server`.
 * Never import this from a Client Component — it uses next/headers + service role keys.
 */
import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

function env(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

/** Use in Server Components, Route Handlers, Server Actions. */
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
            // Server Component cookies are read-only. Middleware refreshes sessions.
          }
        },
      },
    },
  );
}

/** Use in middleware.ts where request/response cookies are exposed. */
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

/** Service-role client — bypasses RLS. Use ONLY in API routes / webhooks. */
export function supabaseAdmin() {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
