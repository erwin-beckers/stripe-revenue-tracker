import Link from "next/link";
import { loadPosts } from "@/lib/content";

export const metadata = { title: "Blog — Stripe Revenue Tracker" };

export default async function BlogIndex() {
  const posts = await loadPosts();

  if (posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-semibold mb-6">Blog</h1>
        <p className="text-muted">Posts coming soon.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold mb-10">Blog</h1>
      <div className="space-y-8">
        {posts.map(post => (
          <article key={post.slug} className="border-b border-white/10 pb-8">
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-2xl font-semibold mb-2 hover:text-accent">{post.title}</h2>
              <p className="text-muted">{post.meta_description}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
