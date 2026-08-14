import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, Lightbulb } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import ShareButton from "@/components/ShareButton";
import StickyMobileCta from "@/components/StickyMobileCta";
import { Button } from "@/components/ui/button";
import { getPost, type Block } from "@/data/blog";

const SITE = "https://surfiaa.com";

const renderBlock = (block: Block, i: number) => {
  switch (block.type) {
    case "p":
      return (
        <p key={i} className="font-body text-foreground/90 leading-relaxed">
          {block.text}
        </p>
      );
    case "h3":
      return (
        <h3 key={i} className="font-display text-xl tracking-tight mt-6">
          {block.text}
        </h3>
      );
    case "list":
      return (
        <ul key={i} className="space-y-2 font-body text-foreground/90">
          {block.items.map((item, j) => (
            <li key={j} className="flex gap-3">
              <span className="text-primary">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div key={i} className="overflow-x-auto glass-card rounded-2xl p-1">
          <table className="w-full text-sm font-body">
            {block.caption && (
              <caption className="text-xs text-muted-foreground p-3 text-left">{block.caption}</caption>
            )}
            <thead>
              <tr className="text-left">
                {block.head.map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-primary font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-t border-border/40">
                  {row.map((cell, c) => (
                    <td key={c} className="px-4 py-3 text-foreground/90 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPost(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const url = `${SITE}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.h1,
    description: post.metaDescription,
    author: { "@type": "Organization", name: "SurfIA" },
    publisher: {
      "@type": "Organization",
      name: "SurfIA",
      logo: { "@type": "ImageObject", url: `${SITE}/pwa-512x512.png` },
    },
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    mainEntityOfPage: url,
    inLanguage: "es-ES",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.h1, item: url },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title={post.metaTitle}
        description={post.metaDescription}
        path={`/blog/${post.slug}`}
        jsonLd={[articleJsonLd, breadcrumbJsonLd, faqJsonLd]}
      />
      <Navbar />

      <main className="flex-1 pt-24 pb-28 md:pb-16 px-4">
        <article className="max-w-3xl mx-auto">
          <nav aria-label="Ruta de navegación" className="text-sm text-muted-foreground font-body mb-6">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{post.category}</span>
          </nav>

          <header className="mb-8">
            <p className="text-primary font-body text-xs font-semibold tracking-widest uppercase mb-3">
              {post.category}
            </p>
            <h1 className="font-display text-4xl md:text-6xl tracking-tight leading-tight">{post.h1}</h1>
            <p className="mt-5 text-lg text-muted-foreground font-body leading-relaxed">{post.intro}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to="/spots">
                <Button variant="hero" size="sm" className="rounded-full">
                  Ver condiciones en tiempo real <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <ShareButton title={post.h1} text={post.excerpt} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground font-body">
              Publicado el{" "}
              {new Date(post.published).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · Lectura ~{post.readingMinutes} min
            </p>
          </header>

          <section aria-labelledby="tldr" className="glass-card rounded-2xl p-6 mb-12">
            <h2 id="tldr" className="font-display text-2xl tracking-tight flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" /> TL;DR — Key takeaways
            </h2>
            <ul className="mt-4 space-y-2 font-body text-foreground/90 text-sm">
              {post.takeaways.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="text-primary">→</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {post.sections.map((s) => (
            <section key={s.h2} className="space-y-4 mb-12">
              <h2 className="font-display text-3xl tracking-tight">{s.h2}</h2>
              {s.blocks.map(renderBlock)}
            </section>
          ))}

          <section className="space-y-4 mb-12">
            <h2 className="font-display text-3xl tracking-tight">Preguntas frecuentes</h2>
            {post.faqs.map((f) => (
              <div key={f.q} className="glass-card rounded-2xl p-5">
                <h3 className="font-body font-semibold text-foreground">{f.q}</h3>
                <p className="font-body text-muted-foreground mt-2 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </section>

          <section className="mb-12">
            <h2 className="font-display text-3xl tracking-tight mb-4">Sigue leyendo</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {post.related.map((r) => (
                <li key={r.to}>
                  <Link
                    to={r.to}
                    className="glass-card rounded-xl p-4 flex items-center justify-between font-body text-sm hover:border-primary/50 transition-colors"
                  >
                    {r.label} <ArrowRight className="h-4 w-4 text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </main>

      <StickyMobileCta />
      <Footer />
    </div>
  );
};

export default BlogPost;
