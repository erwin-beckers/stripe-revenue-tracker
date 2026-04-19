import type { Metadata } from "next";
import "./globals.css";
import { loadLanding } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const landing = await loadLanding();
  return {
    title: `Stripe Revenue Tracker — See your real MRR without logging into Stripe`,
    description: landing?.hero?.subheadline || `A lightweight dashboard for solo SaaS founders who want their MRR,
churn, failed payments, and subscription changes visible on a single
page without clicking through five Stripe screens. Connect your
Stripe account via read-only API key, see everything in 30 seconds.
`,
    openGraph: {
      title: `Stripe Revenue Tracker`,
      description: landing?.hero?.subheadline || `See your real MRR without logging into Stripe`,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" className="font-semibold tracking-tight">Stripe Revenue Tracker</a>
            <div className="flex gap-6 text-sm text-muted">
              <a href="/blog">Blog</a>
              <a href="/#pricing">Pricing</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="mt-24 border-t border-white/10 py-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} Stripe Revenue Tracker
        </footer>
      </body>
    </html>
  );
}
