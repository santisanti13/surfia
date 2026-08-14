import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Compass, MapPin, Thermometer, Wind } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCta from "@/components/StickyMobileCta";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { getRegion, regions } from "@/data/regions";

const RegionPage = () => {
  const { region: slug } = useParams();
  const region = getRegion(slug);

  if (!region) return <Navigate to="/surf" replace />;

  const url = `https://surfiaa.com/surf/${region.slug}`;

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: `Surf en ${region.name}`,
    description: region.intro,
    url,
    touristType: "Surfistas",
    geo: { "@type": "GeoCoordinates", latitude: region.lat, longitude: region.lng },
    containedInPlace: { "@type": "Country", name: "España" },
    includesAttraction: region.spots.map((s) => ({
      "@type": "Beach",
      name: s.name,
      description: s.note,
      address: { "@type": "PostalAddress", addressLocality: s.town, addressCountry: "ES" },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://surfiaa.com/" },
      { "@type": "ListItem", position: 2, name: "Surf en España", item: "https://surfiaa.com/surf" },
      { "@type": "ListItem", position: 3, name: `Surf en ${region.name}`, item: url },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: region.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const others = regions.filter((r) => r.slug !== region.slug);

  const facts = [
    { icon: Compass, label: "Swell ideal", value: region.bestSwell },
    { icon: Wind, label: "Viento ideal", value: region.bestWind },
    { icon: MapPin, label: "Mejor época", value: region.bestSeason },
    { icon: Thermometer, label: "Temperatura del agua", value: region.waterTemp },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title={`Surf en ${region.name}: mejores playas y previsión | SurfIA`}
        description={`Guía de surf en ${region.name}: mejores playas, swell y viento ideal, mejor época del año y previsión de olas en tiempo real spot a spot.`}
        path={`/surf/${region.slug}`}
        jsonLd={[placeJsonLd, breadcrumb, faqJsonLd]}
      />
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4">
        <article className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground font-body mb-6">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <span className="mx-2">/</span>
            <Link to="/surf" className="hover:text-primary">Surf en España</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{region.name}</span>
          </nav>

          <header className="mb-10">
            <p className="text-primary font-body text-xs font-semibold tracking-widest uppercase mb-3">
              {region.province}
            </p>
            <h1 className="font-display text-4xl md:text-6xl tracking-tight leading-tight">
              Surf en {region.name}: mejores playas y previsión
            </h1>
            <p className="mt-5 text-lg text-muted-foreground font-body leading-relaxed">{region.intro}</p>
          </header>

          <section className="grid gap-3 sm:grid-cols-2 mb-12">
            {facts.map((f) => (
              <div key={f.label} className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 text-primary">
                  <f.icon className="h-4 w-4" />
                  <span className="font-body text-xs uppercase tracking-widest">{f.label}</span>
                </div>
                <p className="font-body text-foreground mt-2">{f.value}</p>
              </div>
            ))}
          </section>

          <section className="mb-12">
            <h2 className="font-display text-3xl tracking-tight mb-5">
              Mejores playas para surfear en {region.name}
            </h2>
            <ul className="space-y-4">
              {region.spots.map((s) => (
                <li key={s.name} className="glass-card rounded-2xl p-5">
                  <h3 className="font-display text-xl tracking-tight">{s.name}</h3>
                  <p className="font-body text-xs text-primary mt-1">{s.town}</p>
                  <p className="font-body text-foreground/90 mt-2 leading-relaxed">{s.note}</p>
                </li>
              ))}
            </ul>
            <p className="font-body text-sm text-muted-foreground mt-4">
              Las condiciones cambian a diario: comprueba el oleaje, el viento y la marea del día
              antes de desplazarte.
            </p>
          </section>

          <section className="rounded-2xl border border-border/60 glass-panel p-6 md:p-8 mb-12">
            <h2 className="font-display text-2xl tracking-tight mb-3">
              Previsión en tiempo real de {region.name}
            </h2>
            <p className="font-body text-foreground/90 leading-relaxed mb-5">
              Activa tu ubicación en el mapa y SurfIA ordena los spots por distancia, con oleaje,
              viento y mareas actualizados y una puntuación de 1 a 10 para cada playa.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/spots">
                <Button variant="hero" className="rounded-full">
                  Ver mapa de spots <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/alerts">
                <Button variant="outline" className="rounded-full">Crear una alerta</Button>
              </Link>
            </div>
          </section>

          <section className="space-y-6 mb-12">
            <h2 className="font-display text-3xl tracking-tight">Preguntas frecuentes</h2>
            {region.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-display text-xl">{f.q}</h3>
                <p className="font-body text-foreground/90 mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl tracking-tight mb-4">Otras zonas de surf en España</h2>
            <div className="flex flex-wrap gap-3">
              {others.map((r) => (
                <Link
                  key={r.slug}
                  to={`/surf/${r.slug}`}
                  className="glass-card rounded-full px-4 py-2 text-sm font-body hover:text-primary transition-colors"
                >
                  Surf en {r.shortName}
                </Link>
              ))}
            </div>
          </section>

          <div className="border-t border-border/60 pt-6 flex flex-wrap gap-6">
            <Link to="/surf" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Todas las zonas
            </Link>
            <Link to="/blog/como-leer-previsiones-surf" className="text-sm font-body text-muted-foreground hover:text-primary">
              Cómo leer una previsión de surf
            </Link>
          </div>
        </article>
      </main>

      <StickyMobileCta />
      <Footer />
    </div>
  );
};

export default RegionPage;
