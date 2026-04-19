import { loadPost, loadPosts } from "@/lib/content";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await loadPosts();
  return posts.map(p => ({ slug: p.slug }));
}

// Very small markdown -> HTML (headings + paragraphs + code). No external deps.
function tinyMarkdown(md: string): string {
  return md
    .split("\n\n")
    .map(block => {
      const t = block.trim();
      if (!t) return "";
      if (t.startsWith("### ")) return `<h3>${escapeHtml(t.slice(4))}</h3>`;
      if (t.startsWith("## ")) return `<h2>${escapeHtml(t.slice(3))}</h2>`;
      if (t.startsWith("# ")) return `<h1>${escapeHtml(t.slice(2))}</h1>`;
      if (t.startsWith("```")) {
        const inner = t.replace(/^```[a-z]*\n?/, "").replace(/```$/, "");
        return `<pre><code>${escapeHtml(inner)}</code></pre>`;
      }
      if (/^[-*] /m.test(t)) {
        const items = t.split("\n").filter(l => /^[-*] /.test(l)).map(l => `<li>${inlineMd(l.slice(2))}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inlineMd(t)}</p>`;
    })
    .join("\n");
}

function inlineMd(s: string): string {
  let r = escapeHtml(s);
  r = r.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  r = r.replace(/\*(.+?)\*/g, "<em>$1</em>");
  r = r.replace(/`([^`]+)`/g, "<code>$1</code>");
  r = r.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  return r;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-6 py-16 prose-dark">
      <h1 className="text-4xl font-semibold leading-tight mb-4">{post.h1}</h1>
      <div
        className="mt-8"
        dangerouslySetInnerHTML={{ __html: tinyMarkdown(post.body_markdown) }}
      />
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.meta_description };
}
