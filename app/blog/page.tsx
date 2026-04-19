import Link from "next/link";
import { loadPosts } from "@/lib/content";

export const metadata = { title: "Blog — Stripe Revenue Tracker" };

export default async function BlogIndex() {
  const posts = await loadPosts();

  if (posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-semibold mb-4 text-gradient">Blog</h1>
        <p className="text-fg-muted">Posts coming soon.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">Blog</p>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-gradient leading-tight">
          Writing about the craft.
        </h1>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {posts.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="card group overflow-hidden hover:border-border-strong transition">
            {post.cover_image_url && (
              <div className="aspect-[16/9] overflow-hidden border-b border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.cover_image_url} alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 group-hover:text-accent-hover transition">{post.title}</h2>
              <p className="text-fg-muted text-sm leading-relaxed line-clamp-3">{post.meta_description}</p>
              <div className="mt-4 text-xs text-fg-subtle uppercase tracking-wider">Read article →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
