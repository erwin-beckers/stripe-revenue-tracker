import { promises as fs } from "fs";
import path from "path";

export type PricingTier = {
  name: string;
  price_usd: number;
  period: "month" | "year" | "once";
  features: string[];
  cta: string;
  recommended?: boolean;
  checkout_url?: string;
};

export type LandingCopy = {
  hero: {
    eyebrow?: string;
    headline: string;
    subheadline: string;
    cta_primary: string;
    cta_secondary?: string;
    image_prompt?: string;
    image_url?: string;
  };
  social_proof?: {
    label?: string;
    metrics: Array<{ value: string; label: string }>;
  };
  problem: {
    eyebrow?: string;
    title: string;
    scenarios: string[];
  };
  solution: {
    eyebrow?: string;
    title: string;
    body: string;
  };
  features: Array<{
    title: string;
    body: string;
    image_prompt?: string;
    image_url?: string;
  }>;
  testimonials?: Array<{
    quote: string;
    author: string;
    role: string;
    avatar_prompt?: string;
    avatar_url?: string;
  }>;
  pricing: {
    tagline?: string;
    tiers: PricingTier[];
    guarantee?: string;
  };
  faq: Array<{ q: string; a: string }>;
  cta_final: {
    headline: string;
    body: string;
    button: string;
    urgency?: string;
  };
};

export type BlogPost = {
  title: string;
  slug: string;
  meta_description: string;
  h1: string;
  body_markdown: string;
  target_keyword: string;
  cover_image_prompt?: string;
  cover_image_url?: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

export async function loadLanding(): Promise<LandingCopy | null> {
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, "landing.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loadPosts(): Promise<BlogPost[]> {
  try {
    const dir = path.join(CONTENT_DIR, "posts");
    const files = await fs.readdir(dir);
    const posts = await Promise.all(
      files.filter(f => f.endsWith(".json")).map(async f => {
        const raw = await fs.readFile(path.join(dir, f), "utf-8");
        return JSON.parse(raw) as BlogPost;
      })
    );
    return posts.sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

export async function loadPost(slug: string): Promise<BlogPost | null> {
  const all = await loadPosts();
  return all.find(p => p.slug === slug) || null;
}
