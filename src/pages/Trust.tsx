import { Link } from "react-router-dom";
import { Waves, ShieldCheck, Lock, Database, Mail } from "lucide-react";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <section className="border border-border/60 rounded-xl p-6 bg-card">
    <div className="flex items-center gap-3 mb-3">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="font-display tracking-wide text-xl">{title}</h2>
    </div>
    <div className="text-sm text-muted-foreground font-body space-y-2 leading-relaxed">{children}</div>
  </section>
);

const Trust = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-primary" />
            <span className="font-display text-xl tracking-wide">SURFIA</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary font-body">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="font-display text-4xl md:text-5xl tracking-wide mb-3">
          Centro de confianza
        </h1>
        <p className="text-muted-foreground font-body mb-2">
          Esta página la mantiene el equipo de Surfia para explicar de forma transparente
          cómo tratamos los datos y la seguridad en nuestra app de previsión de surf en España.
        </p>
        <p className="text-xs text-muted-foreground/80 font-body mb-10">
          Contenido editable mantenido por Surfia. No constituye una certificación independiente.
        </p>

        <div className="space-y-5">
          <Section icon={ShieldCheck} title="Autenticación y acceso">
            <p>
              Usamos autenticación gestionada por la plataforma (email/contraseña y Google OAuth)
              y proteccion contra contraseñas filtradas (Have I Been Pwned) en altas y cambios.
            </p>
            <p>
              Cada cuenta solo puede ver y modificar sus propios datos (alertas, favoritos, perfil,
              fotos subidas) gracias a políticas de seguridad a nivel de fila en la base de datos.
            </p>
          </Section>

          <Section icon={Lock} title="Almacenamiento y subida de archivos">
            <p>
              Las fotos de spots se suben a carpetas aisladas por usuario; ningún usuario puede
              escribir, sobrescribir o borrar ficheros en la carpeta de otro.
            </p>
          </Section>

          <Section icon={Database} title="Datos que recopilamos">
            <p>
              Email y nombre/avatar (de Google si te registras con OAuth), tus alertas, tus
              spots favoritos, reseñas y fotos que decidas publicar.
            </p>
            <p>
              La geolocalización es opcional y solo se usa en el dispositivo para ordenar spots
              por proximidad. No la almacenamos en servidor.
            </p>
          </Section>

          <Section icon={Database} title="Proveedores que utilizamos">
            <ul className="list-disc pl-5 space-y-1">
              <li>Lovable Cloud (backend, autenticación, base de datos, storage)</li>
              <li>AEMET — datos meteorológicos y marítimos oficiales (España)</li>
              <li>Stormglass — datos de oleaje y viento</li>
              <li>OpenStreetMap — tiles del mapa</li>
            </ul>
          </Section>

          <Section icon={Mail} title="Contacto de seguridad">
            <p>
              Si crees haber encontrado una vulnerabilidad, escríbenos a{" "}
              <a href="mailto:security@surfiaa.com" className="text-primary underline">
                security@surfiaa.com
              </a>
              . Te responderemos lo antes posible.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Trust;
