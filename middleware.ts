import { NextResponse, type NextRequest } from "next/server";
import { supabaseMiddleware } from "@/lib/supabase";

const PROTECTED_PREFIXES = ["/app", "/account"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const supabase = supabaseMiddleware(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Skip static files and internal paths
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
