import { loadLanding } from "@/lib/content";
import type { FeatureIcon } from "@/lib/content";

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function FeatureGlyph({ name }: { name?: FeatureIcon }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "chart":         return <svg {...common}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case "shield":        return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "zap":           return <svg {...common}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case "refresh":       return <svg {...common}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>;
    case "bell":          return <svg {...common}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
    case "settings":      return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9 1.65 1.65 0 004.27 7.18l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6 1.65 1.65 0 0010 3.09V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    case "users":         return <svg {...common}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
    case "mail":          return <svg {...common}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    case "lock":          return <svg {...common}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
    case "eye":           return <svg {...common}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "trending-up":   return <svg {...common}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    case "check-circle":  return <svg {...common}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case "layers":        return <svg {...common}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
    case "database":      return <svg {...common}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
    case "key":           return <svg {...common}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
    case "clock":         return <svg {...common}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    default:              return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

export default async function Home() {
  const landing = await loadLanding();

  if (!landing) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-semibold mb-4 text-gradient">Stripe Revenue Tracker</h1>
        <p className="text-fg-muted text-lg">See your real MRR without logging into Stripe</p>
        <p className="mt-10 text-sm text-fg-subtle">
          Landing copy generating… run <code className="bg-bg-card px-2 py-0.5 rounded">generate_content.py</code> + <code className="bg-bg-card px-2 py-0.5 rounded">generate_images.py</code>.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center fade-in">
          {landing.hero.eyebrow && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-fg-muted mb-6 bg-bg-elevated">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {landing.hero.eyebrow}
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-gradient">
            {landing.hero.headline}
          </h1>
          <p className="mt-6 text-xl text-fg-muted max-w-2xl mx-auto leading-relaxed">
            {landing.hero.subheadline}
          </p>
          <div className="mt-10 flex gap-3 justify-center flex-wrap">
            <a href="#pricing" className="btn-primary">
              {landing.hero.cta_primary} <ArrowIcon />
            </a>
            {landing.hero.cta_secondary && (
              <a href="#features" className="btn-secondary">{landing.hero.cta_secondary}</a>
            )}
          </div>
        </div>

        {/* Hero image — editorial illustration, not fake UI */}
        {landing.hero.image_url && (
          <div className="max-w-4xl mx-auto mt-16 px-6">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] bg-bg-elevated fade-in aspect-[16/9]" style={{ animationDelay: "0.2s" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={landing.hero.image_url} alt={landing.hero.headline}
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        )}
      </section>

      {/* Social proof */}
      {landing.social_proof && landing.social_proof.metrics.length > 0 && (
        <section className="py-10 border-t border-b border-border bg-bg-elevated/40">
          <div className="max-w-5xl mx-auto px-6">
            {landing.social_proof.label && (
              <p className="text-center text-xs uppercase tracking-widest text-fg-subtle mb-6">{landing.social_proof.label}</p>
            )}
            <div className="grid grid-cols-3 gap-8">
              {landing.social_proof.metrics.map((m, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-semibold text-gradient">{m.value}</div>
                  <div className="text-sm text-fg-muted mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Problem */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          {landing.problem.eyebrow && (
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">{landing.problem.eyebrow}</p>
          )}
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient mb-10 leading-tight">
            {landing.problem.title}
          </h2>
          <div className="space-y-5">
            {landing.problem.scenarios.map((s, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-red-400 text-sm font-medium">{i + 1}</span>
                </div>
                <p className="text-lg text-fg-muted leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          {landing.solution.eyebrow && (
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">{landing.solution.eyebrow}</p>
          )}
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient mb-6 leading-tight">
            {landing.solution.title}
          </h2>
          <p className="text-xl text-fg-muted leading-relaxed">{landing.solution.body}</p>
        </div>
      </section>

      {/* Features — icons + typography, no fake screenshots */}
      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient">Everything you need. Nothing you don&apos;t.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landing.features.map((f, i) => (
              <div key={i} className="card p-7 hover:border-border-strong transition group">
                <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-5 group-hover:bg-accent/15 transition">
                  <FeatureGlyph name={f.icon} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-fg-muted text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who this is for */}
      {landing.who_this_is_for && landing.who_this_is_for.items.length > 0 && (
        <section className="py-24 border-t border-border">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              {landing.who_this_is_for.eyebrow && (
                <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">{landing.who_this_is_for.eyebrow}</p>
              )}
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient leading-tight">
                {landing.who_this_is_for.title}
              </h2>
            </div>
            <ul className="space-y-4 max-w-2xl mx-auto">
              {landing.who_this_is_for.items.map((item, i) => (
                <li key={i} className="flex gap-4 items-start card p-5">
                  <span className="text-accent flex-shrink-0 mt-0.5"><CheckIcon /></span>
                  <span className="text-fg leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient mb-3">Simple. Honest. Cancel anytime.</h2>
            {landing.pricing.tagline && (
              <p className="text-lg text-fg-muted">{landing.pricing.tagline}</p>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {landing.pricing.tiers.map((tier, i) => (
              <div key={i} className={`card p-8 relative ${tier.recommended ? "border-accent/40 shadow-[0_0_40px_-10px] shadow-accent-glow" : ""}`}>
                {tier.recommended && (
                  <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-accent text-white text-xs font-medium">
                    Most popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-semibold">${tier.price_usd}</span>
                  <span className="text-fg-muted">/{tier.period}</span>
                </div>
                {tier.trial_days ? (
                  <p className="text-sm text-accent mb-5">
                    {tier.trial_days}-day free trial · No card charged until day {tier.trial_days + 1}
                  </p>
                ) : (
                  <div className="mb-5" />
                )}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-fg-muted text-sm">
                      <span className="text-accent flex-shrink-0 mt-0.5"><CheckIcon /></span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.checkout_url || process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL || "#"}
                  className={tier.recommended ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center flex"}
                >
                  {tier.trial_days ? `Start ${tier.trial_days}-day free trial` : tier.cta}
                </a>
              </div>
            ))}
          </div>
          {landing.pricing.guarantee && (
            <p className="text-center text-sm text-fg-muted mt-8">
              <span className="inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                {landing.pricing.guarantee}
              </span>
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient">Questions we get.</h2>
          </div>
          <div className="space-y-4">
            {landing.faq.map((f, i) => (
              <details key={i} className="card p-6 group cursor-pointer">
                <summary className="flex justify-between items-center font-medium text-fg list-none">
                  <span>{f.q}</span>
                  <span className="text-fg-muted group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-4 text-fg-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient leading-tight">
            {landing.cta_final.headline}
          </h2>
          <p className="mt-6 text-xl text-fg-muted">{landing.cta_final.body}</p>
          {landing.cta_final.urgency && (
            <p className="mt-4 text-sm text-accent">⏱ {landing.cta_final.urgency}</p>
          )}
          <a href="#pricing" className="btn-primary mt-10">{landing.cta_final.button} <ArrowIcon /></a>
        </div>
      </section>
    </>
  );
}
