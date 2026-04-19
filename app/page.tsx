import { loadLanding } from "@/lib/content";

export default async function Home() {
  const landing = await loadLanding();

  if (!landing) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold mb-4">Stripe Revenue Tracker</h1>
        <p className="text-muted">See your real MRR without logging into Stripe</p>
        <p className="mt-8 text-sm text-muted">
          Landing copy is generating. Run <code>factory/scripts/generate_content.py stripe-revenue-tracker</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Hero */}
      <section className="py-24 text-center">
        <h1 className="text-5xl font-semibold tracking-tight leading-tight">
          {landing.hero.headline}
        </h1>
        <p className="mt-6 text-xl text-muted max-w-2xl mx-auto">{landing.hero.subheadline}</p>
        <a
          href="#pricing"
          className="inline-block mt-10 px-6 py-3 rounded bg-accent hover:bg-blue-500 text-white font-medium transition"
        >
          {landing.hero.cta}
        </a>
      </section>

      {/* Problem */}
      <section className="py-16 border-t border-white/10">
        <h2 className="text-3xl font-semibold mb-6">{landing.problem.title}</h2>
        <p className="text-lg text-muted whitespace-pre-wrap">{landing.problem.body}</p>
      </section>

      {/* Solution */}
      <section className="py-16 border-t border-white/10">
        <h2 className="text-3xl font-semibold mb-6">{landing.solution.title}</h2>
        <p className="text-lg text-muted whitespace-pre-wrap">{landing.solution.body}</p>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-white/10">
        <h2 className="text-3xl font-semibold mb-8">What you get</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {landing.features.map((f, i) => (
            <div key={i} className="border border-white/10 p-6 rounded">
              <h3 className="font-semibold text-lg mb-3">{f.title}</h3>
              <p className="text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 border-t border-white/10 text-center">
        <h2 className="text-3xl font-semibold mb-6">{landing.cta_final.headline}</h2>
        <p className="text-muted mb-8">{landing.cta_final.body}</p>
        <a
          href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL || "#"}
          className="inline-block px-6 py-3 rounded bg-accent hover:bg-blue-500 text-white font-medium"
        >
          {landing.cta_final.button}
        </a>
      </section>

      {/* FAQs */}
      <section className="py-16 border-t border-white/10">
        <h2 className="text-3xl font-semibold mb-8">FAQ</h2>
        <div className="space-y-6">
          {landing.faqs.map((f, i) => (
            <div key={i}>
              <h3 className="font-semibold mb-2">{f.q}</h3>
              <p className="text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
