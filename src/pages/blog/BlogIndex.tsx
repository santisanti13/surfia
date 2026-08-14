import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import StickyMobileCta from "@/components/StickyMobileCta";
import { posts } from "@/data/blog";

const legacy = {
  slug: "como-leer-previsiones-surf",
  category: "Previsión",
  h1: "Cómo leer previsiones para hacer surf",
  excerpt:
    "Altura, periodo, dirección del swell, viento y marea explicados paso a paso para decidir dónde y cuándo entrar al agua.",
  readingMinutes: 7,
};

const all = [legacy, ...posts];

const BlogIndex = () => {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Blog de surf de SurfIA",
    itemListElement: all.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.h1,
      url: `https://surfiaa.com/blog/${p.slug}`,
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://surfiaa.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://surfiaa.com/blog" },
    ],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Blog de surf: guías de previsión, spots y material | SurfIA"
        description="Guías prácticas para surfistas en España: cómo leer previsiones, cuándo hay olas, mareas, playas para aprender y cómo elegir tabla."
        path="/blog"
        jsonLd={[itemList, breadcrumb]}
      />
      <Navbar />

      <main className="flex-1 pt-28 pb-28 md:pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <nav aria-label="Ruta de navegación" className="text-sm text-muted-foreground font-body mb-6">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Blog</span>
          </nav>

          <h1 className="font-display text-4xl md:text-6xl tracking-tight">
            Guías de surf para leer el mar mejor
          </h1>
          <p className="mt-5 text-lg text-muted-foreground font-body max-w-2xl leading-relaxed">
            Previsión, mareas, spots y material explicados sin humo, con datos aplicables a las
            costas de España. Cuando termines de leer, comprueba las condiciones reales en el{" "}
            <Link to="/spots" className="text-primary underline underline-offset-4">
              mapa de spots
            </Link>
            .
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {all.map((p) => (
              <article key={p.slug} className="glass-card rounded-2xl p-6 hover:border-primary/50 transition-colors">
                <span className="font-body text-xs uppercase tracking-widest text-primary">{p.category}</span>
                <h2 className="font-display text-2xl mt-2 tracking-tight">
                  <Link to={`/blog/${p.slug}`}>{p.h1}</Link>
                </h2>
                <p className="font-body text-sm text-muted-foreground mt-2">{p.excerpt}</p>
                <p className="mt-4 flex items-center gap-4 text-sm font-body text-primary">
                  <span className="inline-flex items-center gap-2">
                    Leer guía <ArrowRight className="h-4 w-4" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="h-3 w-3" /> {p.readingMinutes} min
                  </span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>

      <StickyMobileCta />
      <Footer />
    </div>
  );
};

export default BlogIndex;
