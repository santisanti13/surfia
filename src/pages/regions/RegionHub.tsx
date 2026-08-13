import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { regions } from "@/data/regions";

const RegionHub = () => {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Zonas de surf en España",
    itemListElement: regions.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Surf en ${r.name}`,
      url: `https://surfiaa.com/surf/${r.slug}`,
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://surfiaa.com/" },
      { "@type": "ListItem", position: 2, name: "Surf en España", item: "https://surfiaa.com/surf" },
    ],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Surf en España por zonas — previsión y mejores playas | SurfIA"
        description="Guías de surf por comunidades: País Vasco, Cantabria, Asturias, Galicia, Andalucía y Canarias. Mejores playas, swell y viento ideal, y previsión en tiempo real."
        path="/surf"
        jsonLd={[itemList, breadcrumb]}
      />
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-4xl md:text-6xl tracking-tight">Surf en España por zonas</h1>
          <p className="mt-5 text-lg text-muted-foreground font-body max-w-2xl leading-relaxed">
            Elige tu costa y descubre las mejores playas para surfear, con qué swell y viento
            funcionan y cuándo es la mejor época. Después consulta la previsión en tiempo real de
            cada spot en el mapa de SurfIA.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((r) => (
              <Link
                key={r.slug}
                to={`/surf/${r.slug}`}
                className="glass-card rounded-2xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="h-4 w-4" />
                  <span className="font-body text-xs uppercase tracking-widest">{r.province}</span>
                </div>
                <h2 className="font-display text-2xl mt-2 tracking-tight">Surf en {r.name}</h2>
                <p className="font-body text-sm text-muted-foreground mt-2 line-clamp-3">{r.intro}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-body text-primary">
                  Ver guía <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegionHub;
