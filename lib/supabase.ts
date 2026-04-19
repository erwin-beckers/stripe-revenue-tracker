/**
 * Browser-safe Supabase module. Re-exported from everywhere as `@/lib/supabase`.
 * For server-side usage (cookies/headers), import from `@/lib/supabase-server`.
 */
import { createBrowserClient } from "@supabase/ssr";

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
