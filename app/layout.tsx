import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { loadLanding } from "@/lib/content";
import { supabaseServer } from "@/lib/supabase";

export async function generateMetadata(): Promise<Metadata> {
  const landing = await loadLanding();
  const title = `Stripe Revenue Tracker — See your real MRR without logging into Stripe`;
  const description = landing?.hero?.subheadline || `A lightweight dashboard for solo SaaS founders who want their MRR,
churn, failed payments, and subscription changes visible on a single
page without clicking through five Stripe screens. Connect your
Stripe account via read-only API key, see everything in 30 seconds.
`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer().catch(() => null);
  const { data: { user } = { user: null } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-bg/70 border-b border-border">
          <nav className="max-w-6xl mx-auto px-6 h-14 flex justify-between items-center">
            <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-accent-hover shadow-[0_0_12px_2px] shadow-accent-glow" />
              <span>Stripe Revenue Tracker</span>
            </a>
            <div className="flex gap-7 text-sm text-fg-muted items-center">
              <a href="/#features" className="hover:text-fg transition hidden sm:inline">Features</a>
              <a href="/#pricing" className="hover:text-fg transition hidden sm:inline">Pricing</a>
              <a href="/blog" className="hover:text-fg transition hidden sm:inline">Blog</a>
              {user ? (
                <a href="/account" className="btn-primary !py-1.5 !px-4 !text-sm">Account</a>
              ) : (
                <>
                  <a href="/login" className="hover:text-fg transition">Sign in</a>
                  <a href="/#pricing" className="btn-primary !py-1.5 !px-4 !text-sm">Start free</a>
                </>
              )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mt-32 border-t border-border py-10 text-center text-xs text-fg-subtle">
          <div className="max-w-6xl mx-auto px-6 flex justify-between">
            <span>© {new Date().getFullYear()} Stripe Revenue Tracker</span>
            <span>Shipped by the factory.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
