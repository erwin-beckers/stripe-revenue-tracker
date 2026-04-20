/**
 * Browser-safe Supabase module. Imported as `@/lib/supabase` from Client Components.
 * For server-side (cookies/headers), use `@/lib/supabase-server`.
 *
 * IMPORTANT: NEXT_PUBLIC_* vars only get inlined into the client bundle when accessed
 * as a literal property (process.env.NEXT_PUBLIC_FOO). Dynamic access (process.env[k])
 * is invisible to Next.js's webpack DefinePlugin and will be undefined at runtime.
 */
import { createBrowserClient } from "@supabase/ssr";

export const PRODUCT_ID = process.env.NEXT_PUBLIC_PRODUCT_ID ?? "unknown";

/** Client-side: use in Client Components and browser code. */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars. Redeploy with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set at build time."
    );
  }
  return createBrowserClient(url, anonKey);
}
