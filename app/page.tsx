import { loadLanding } from "@/lib/content";

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

        {/* Hero image */}
        {landing.hero.image_url && (
          <div className="max-w-5xl mx-auto mt-16 px-6">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] bg-bg-elevated fade-in" style={{ animationDelay: "0.2s" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={landing.hero.image_url} alt={landing.hero.headline}
                className="w-full h-auto" />
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

      {/* Features */}
      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient">Everything you need. Nothing you don&apos;t.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landing.features.map((f, i) => (
              <div key={i} className="card p-7 hover:border-border-strong transition group">
                {f.image_url && (
                  <div className="mb-5 rounded-lg overflow-hidden border border-border aspect-[3/2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.image_url} alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-fg-muted text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {landing.testimonials && landing.testimonials.length > 0 && (
        <section className="py-24 border-t border-border">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">Testimonials</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gradient">From real founders.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {landing.testimonials.map((t, i) => (
                <div key={i} className="card p-7 flex flex-col">
                  <div className="text-accent text-3xl leading-none mb-3">&ldquo;</div>
                  <p className="text-fg leading-relaxed flex-1">{t.quote}</p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                    {t.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatar_url} alt={t.author}
                        className="w-10 h-10 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-hover" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{t.author}</div>
                      <div className="text-xs text-fg-muted">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-5xl font-semibold">${tier.price_usd}</span>
                  <span className="text-fg-muted">/{tier.period}</span>
                </div>
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
                  {tier.cta}
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
