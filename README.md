# Stripe Revenue Tracker

See your real MRR without logging into Stripe

A lightweight dashboard for solo SaaS founders who want their MRR,
churn, failed payments, and subscription changes visible on a single
page without clicking through five Stripe screens. Connect your
Stripe account via read-only API key, see everything in 30 seconds.


---

Scaffolded by [factory](../../factory).

## Local dev

```bash
npm install
npm run dev
```

Landing copy and blog posts are loaded at build time from `content/landing.json` and `content/posts/*.json`.

Regenerate content:
```bash
cd ../../factory
python scripts/generate_content.py stripe-revenue-tracker
```

## Deploy

Auto-deploys on every push to `main` via Vercel. Env vars to set in Vercel dashboard:
- `NEXT_PUBLIC_POLAR_CHECKOUT_URL` — Polar.sh checkout link from `factory.db` resources table
