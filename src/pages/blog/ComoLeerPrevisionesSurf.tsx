import { Link } from "react-router-dom";
import { Waves, Wind, Compass, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";

const PUBLISHED = "2026-06-23";

const ComoLeerPrevisionesSurf = () => {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Cómo leer previsiones para hacer surf: guía completa",
    description:
      "Aprende a interpretar altura de la ola, periodo del swell, dirección del viento y mareas para elegir el mejor momento y spot para surfear.",
    author: { "@type": "Organization", name: "SurfIA" },
    publisher: {
      "@type": "Organization",
      name: "SurfIA",
      logo: { "@type": "ImageObject", url: "https://surfiaa.com/pwa-512x512.png" },
    },
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    mainEntityOfPage: "https://surfiaa.com/blog/como-leer-previsiones-surf",
    inLanguage: "es-ES",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://surfiaa.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://surfiaa.com/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Cómo leer previsiones de surf",
        item: "https://surfiaa.com/blog/como-leer-previsiones-surf",
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Qué altura de ola es buena para surfear?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Para iniciación, entre 0,5 y 1 m. Para nivel intermedio, 1 a 1,8 m. Para surfistas avanzados, a partir de 1,8 m y con periodo largo.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué es el periodo del swell?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Es el tiempo en segundos entre dos olas consecutivas. Por debajo de 8 s la mar suele estar revuelta; entre 10 y 14 s el oleaje es de calidad, y a partir de 15 s hablamos de groundswell con olas potentes y bien formadas.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué viento es mejor para hacer surf?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El viento offshore (de tierra al mar) limpia y forma la ola. El onshore (de mar a tierra) la rompe y la desordena. El cross-offshore suele ser un buen compromiso.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Cómo leer previsiones para hacer surf — Guía completa | SurfIA"
        description="Guía práctica para interpretar previsiones de surf: altura y periodo del swell, dirección del viento, mareas y cómo elegir el mejor momento para entrar al agua."
        path="/blog/como-leer-previsiones-surf"
        jsonLd={[articleJsonLd, breadcrumbJsonLd, faqJsonLd]}
      />
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4">
        <article className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground font-body mb-6">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <span className="mx-2">/</span>
            <span>Blog</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Cómo leer previsiones de surf</span>
          </nav>

          <header className="mb-10">
            <p className="text-primary font-body text-xs font-semibold tracking-widest uppercase mb-3">
              Guía para principiantes
            </p>
            <h1 className="font-display text-4xl md:text-6xl tracking-tight leading-tight">
              Cómo leer previsiones para hacer surf
            </h1>
            <p className="mt-5 text-lg text-muted-foreground font-body leading-relaxed">
              Las apps y boyas muestran un montón de números: altura, periodo, dirección, viento,
              marea… Esta guía te enseña a interpretarlos para decidir <strong>dónde y cuándo</strong>{" "}
              meterte al agua, ya seas principiante o estés afinando tu lectura del mar.
            </p>
            <p className="mt-3 text-xs text-muted-foreground font-body">
              Publicado el 23 de junio de 2026 · Lectura ~7 min
            </p>
          </header>

          <section className="space-y-4 mb-12">
            <h2 className="font-display text-3xl tracking-tight flex items-center gap-3">
              <Waves className="h-7 w-7 text-primary" />
              Altura de la ola: ¿cuánto es mucho?
            </h2>
            <p className="font-body text-foreground/90 leading-relaxed">
              La altura suele expresarse en <strong>metros</strong> o pies. Es la distancia vertical
              entre el seno y la cresta de la ola en aguas profundas. Cuando rompe en la orilla, la
              ola real puede ser <em>algo más grande</em> que la previsión, sobre todo en spots con
              fondo de roca o playas que recogen mucho swell.
            </p>
            <ul className="font-body text-foreground/90 space-y-2 list-disc pl-6">
              <li><strong>0,3 – 0,8 m</strong>: iniciación, longboard y espumas.</li>
              <li><strong>0,8 – 1,5 m</strong>: nivel intermedio, surf divertido.</li>
              <li><strong>1,5 – 2,5 m</strong>: avanzado, olas con fuerza.</li>
              <li><strong>+2,5 m</strong>: solo experimentados, mucho cuidado con corrientes.</li>
            </ul>
          </section>

          <section className="space-y-4 mb-12">
            <h2 className="font-display text-3xl tracking-tight flex items-center gap-3">
              <Clock className="h-7 w-7 text-primary" />
              Periodo del swell: la clave de la calidad
            </h2>
            <p className="font-body text-foreground/90 leading-relaxed">
              El <strong>periodo</strong> es el tiempo en segundos entre dos olas. Es probablemente
              el dato más importante para saber si va a haber olas <em>buenas</em>, no solo grandes.
            </p>
            <ul className="font-body text-foreground/90 space-y-2 list-disc pl-6">
              <li><strong>&lt; 8 s</strong>: windswell, mar revuelta, olas cortas y débiles.</li>
              <li><strong>8 – 11 s</strong>: oleaje correcto, con fuerza media.</li>
              <li><strong>11 – 14 s</strong>: swell de calidad, olas bien formadas.</li>
              <li><strong>+14 s</strong>: groundswell, olas potentes y con mucha pared.</li>
            </ul>
            <p className="font-body text-foreground/90 leading-relaxed">
              Truco rápido: una ola de <strong>1 m con 14 s</strong> rompe con más fuerza y forma
              que una de <strong>1,5 m con 7 s</strong>. Mira siempre los dos números juntos.
            </p>
          </section>

          <section className="space-y-4 mb-12">
            <h2 className="font-display text-3xl tracking-tight flex items-center gap-3">
              <Compass className="h-7 w-7 text-primary" />
              Dirección del swell: ¿le entra a tu spot?
            </h2>
            <p className="font-body text-foreground/90 leading-relaxed">
              Cada spot tiene una <strong>orientación óptima</strong>. En el norte de España, por
              ejemplo, la mayoría de playas funcionan con swells del <strong>NO o N</strong>. Si la
              previsión marca un swell del sur, esas playas probablemente estén planas.
            </p>
            <p className="font-body text-foreground/90 leading-relaxed">
              Aprende la dirección de tu spot habitual y compárala con la previsión: ángulos
              cercanos = más energía entrando.
            </p>
          </section>

          <section className="space-y-4 mb-12">
            <h2 className="font-display text-3xl tracking-tight flex items-center gap-3">
              <Wind className="h-7 w-7 text-primary" />
              Viento: lo que separa una sesión épica de una mala
            </h2>
            <ul className="font-body text-foreground/90 space-y-2 list-disc pl-6">
              <li><strong>Offshore</strong> (de tierra al mar): peina la ola, la forma, ideal.</li>
              <li><strong>Onshore</strong> (de mar a tierra): la deshace, mar de viento.</li>
              <li><strong>Cross-shore</strong> (paralelo a la playa): aceptable según fuerza.</li>
              <li><strong>Cross-offshore</strong>: combinación habitual de sesiones buenas.</li>
            </ul>
            <p className="font-body text-foreground/90 leading-relaxed">
              Como regla, busca <strong>vientos por debajo de 15 nudos</strong>. Por encima, salvo
              que sea offshore puro y la ola tenga pared, la calidad cae rápido.
            </p>
          </section>

          <section className="space-y-4 mb-12">
            <h2 className="font-display text-3xl tracking-tight">Mareas: ventana correcta, spot correcto</h2>
            <p className="font-body text-foreground/90 leading-relaxed">
              Algunos picos funcionan con <strong>marea alta</strong>, otros solo con la{" "}
              <strong>baja</strong>. Las playas suelen romper mejor en marea media subiendo o
              bajando. Consulta el coeficiente: coeficientes altos (&gt;90) significan más agua
              moviéndose y más corriente.
            </p>
          </section>

          <section className="space-y-4 mb-12">
            <h2 className="font-display text-3xl tracking-tight">Checklist rápida antes de coger el coche</h2>
            <ol className="font-body text-foreground/90 space-y-2 list-decimal pl-6">
              <li>¿La <strong>dirección</strong> del swell entra al spot?</li>
              <li>¿El <strong>periodo</strong> es de 10 s o más?</li>
              <li>¿El <strong>viento</strong> es offshore o flojo?</li>
              <li>¿La <strong>marea</strong> coincide con la ventana óptima del pico?</li>
              <li>¿La <strong>altura</strong> está dentro de tu nivel?</li>
            </ol>
            <p className="font-body text-foreground/90 leading-relaxed">
              Si tres de cinco están en verde, la sesión suele merecer la pena. Si tienes los cinco,
              ¡corre!
            </p>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 mb-12">
            <h2 className="font-display text-2xl tracking-tight mb-3">
              Consulta la previsión en tiempo real en SurfIA
            </h2>
            <p className="font-body text-foreground/90 leading-relaxed mb-5">
              Ya sabes leerla: ahora ponla en práctica. Explora cientos de spots de la costa
              española con datos de oleaje, viento y mareas actualizados.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/spots">
                <Button variant="hero" className="rounded-full">
                  Ver mapa de spots <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/alerts">
                <Button variant="outline" className="rounded-full">
                  Crear una alerta
                </Button>
              </Link>
            </div>
          </section>

          <section className="space-y-6 mb-12">
            <h2 className="font-display text-3xl tracking-tight">Preguntas frecuentes</h2>
            <div>
              <h3 className="font-display text-xl">¿Qué altura de ola es buena para surfear?</h3>
              <p className="font-body text-foreground/90 mt-1">
                Para iniciación, entre 0,5 y 1 m. Intermedio, 1 a 1,8 m. Avanzado, a partir de
                1,8 m y con periodo largo.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl">¿Qué es el periodo del swell?</h3>
              <p className="font-body text-foreground/90 mt-1">
                Tiempo en segundos entre olas consecutivas. Cuanto mayor, más calidad y fuerza
                tiene el oleaje.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl">¿Qué viento es mejor para hacer surf?</h3>
              <p className="font-body text-foreground/90 mt-1">
                El offshore (de tierra al mar) es el ideal. El onshore (de mar a tierra) suele
                arruinar la sesión.
              </p>
            </div>
          </section>

          <div className="border-t border-border/60 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default ComoLeerPrevisionesSurf;
