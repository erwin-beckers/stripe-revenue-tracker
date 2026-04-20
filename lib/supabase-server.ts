/**
 * Server-only Supabase clients. Import from `@/lib/supabase-server`.
 * Never import this from a Client Component — it uses next/headers + service role keys.
 */
import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

function required(name: string, v: string | undefined): string {
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

/** Use in Server Components, Route Handlers, Server Actions. */
export async function supabaseServer() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anon = required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (all: { name: string; value: string; options?: CookieOptions }[]) => {
        try {
          all.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Component cookies are read-only. Middleware refreshes sessions.
        }
      },
    },
  });
}

/** Use in middleware.ts where request/response cookies are exposed. */
export function supabaseMiddleware(req: NextRequest, res: NextResponse) {
  const url = required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anon = required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (all: { name: string; value: string; options?: CookieOptions }[]) => {
        all.forEach(({ name, value }) => req.cookies.set(name, value));
        all.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options as CookieOptions));
      },
    },
  });
}

/** Service-role client — bypasses RLS. Use ONLY in API routes / webhooks. */
export function supabaseAdmin() {
  const url = required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  const service = required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
