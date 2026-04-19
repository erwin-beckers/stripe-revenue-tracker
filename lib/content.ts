import { promises as fs } from "fs";
import path from "path";

export type LandingCopy = {
  hero: { headline: string; subheadline: string; cta: string };
  problem: { title: string; body: string };
  solution: { title: string; body: string };
  features: Array<{ title: string; body: string }>;
  faqs: Array<{ q: string; a: string }>;
  cta_final: { headline: string; body: string; button: string };
};

export type BlogPost = {
  title: string;
  slug: string;
  meta_description: string;
  h1: string;
  body_markdown: string;
  target_keyword: string;
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
