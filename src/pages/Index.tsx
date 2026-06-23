import { Waves, Wind, Thermometer, ArrowRight, MapPin, ChevronDown, Compass, BarChart3, Radio, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, type Easing } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import SpotCard from "@/components/SpotCard";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const spots = [
  {
    name: "Pipeline, Oahu",
    location: "Hawaii, USA",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=2070&auto=format&fit=crop",
    swell: "8-12 ft",
    wind: "Offshore 15kts",
    temp: "26°C",
    rating: "Epic",
  },
  {
    name: "Uluwatu",
    location: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1515404929826-76fff9fef6fe?q=80&w=2070&auto=format&fit=crop",
    swell: "4-6 ft",
    wind: "Cross-off 10kts",
    temp: "28°C",
    rating: "Good",
  },
  {
    name: "Teahupo'o",
    location: "Tahiti, French Polynesia",
    image: "https://images.unsplash.com/photo-1526342122811-2a9c8512023d?q=80&w=2070&auto=format&fit=crop",
    swell: "10-15 ft",
    wind: "Light 5kts",
    temp: "27°C",
    rating: "Epic",
  },
];

const features = [
  { icon: BarChart3, title: "Previsiones a 16 días" },
  { icon: Compass, title: "Modelado costero de alta resolución" },
  { icon: Radio, title: "Viento y mareas en tiempo real" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as Easing },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=2070&auto=format&fit=crop"
            alt="Surfer catching a wave"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[8rem] md:text-[12rem] leading-none font-display tracking-tight text-primary"
          >
            SURFIA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-foreground/80 max-w-xl mx-auto mt-4 font-body font-light"
          >
            Previsión de olas en tiempo real cerca de ti. Consulta oleaje, viento y marejada en los mejores spots de surf.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/spots">
                <Button variant="hero" size="lg" className="rounded-full px-10 py-6 text-base">
                  Explorar Spots <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/alerts">
                <Button variant="glass" size="lg" className="rounded-full px-10 py-6 text-base">
                  <Bell className="mr-2 h-5 w-5" /> Ver Alertas
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-foreground/50"
        >
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </section>

      {/* Trending Spots */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-primary font-body text-sm font-semibold tracking-widest uppercase">Tendencia</span>
              <h2 className="text-5xl md:text-7xl font-display tracking-tight mt-2">
                Mejores <span className="text-gradient-ocean">Spots</span>
              </h2>
            </div>
            <Link to="/spots" className="text-muted-foreground hover:text-primary transition-colors font-body text-sm tracking-wide uppercase flex items-center gap-2">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spots.map((spot, i) => (
              <motion.div
                key={spot.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                <SpotCard {...spot} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Forecasting */}
      <section className="py-24 px-4 bg-ocean-gradient">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <span className="text-primary font-body text-sm font-semibold tracking-widest uppercase">Precisión</span>
            <h2 className="text-5xl md:text-7xl font-display tracking-tight mt-2 mb-6">
              Previsión
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg mb-8">
              Nuestros modelos combinan datos de boyas y batimetría local para ofrecerte las predicciones de olas más precisas.
            </p>
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i + 1}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-body text-foreground/90">{f.title}</span>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={4}
              className="mt-8"
            >
              <Link to="/spots">
                <Button variant="hero" size="lg" className="rounded-full px-8 py-5">
                  Ver Previsiones <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
            className="glass-card rounded-2xl p-8 glow-primary"
          >
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-body">Current Swell</p>
              <p className="text-7xl font-display mt-2 text-gradient-ocean">6.5ft</p>
              <p className="text-muted-foreground font-body mt-1">@ 14s WNW</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Waves, label: "Swell", value: "6-8 ft" },
                { icon: Wind, label: "Wind", value: "12 kts" },
                { icon: Thermometer, label: "Water", value: "22°C" },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-xl bg-secondary/50">
                  <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">{item.label}</p>
                  <p className="text-lg font-display mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
