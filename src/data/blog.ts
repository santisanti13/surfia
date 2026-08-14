export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; caption?: string; head: string[]; rows: string[][] };

export interface Section {
  h2: string;
  blocks: Block[];
}

export interface BlogPost {
  slug: string;
  /** Meta title (distinto del H1) */
  metaTitle: string;
  metaDescription: string;
  h1: string;
  category: string;
  excerpt: string;
  published: string;
  updated?: string;
  readingMinutes: number;
  intro: string;
  takeaways: string[];
  sections: Section[];
  faqs: { q: string; a: string }[];
  related: { label: string; to: string }[];
}

export const posts: BlogPost[] = [
  {
    slug: "mejores-playas-para-aprender-a-surfear-en-espana",
    metaTitle: "Mejores playas para aprender surf en España (2026) | SurfIA",
    metaDescription:
      "Comparativa de las mejores playas de España para aprender a surfear: fondo, tamaño habitual, mejor marea y época. Con previsión en tiempo real de cada spot.",
    h1: "Dónde aprender a surfear en España: playas fáciles costa por costa",
    category: "Iniciación",
    excerpt:
      "Playas de arena, olas tolerantes y previsión sencilla: la selección de spots para dar tus primeras remadas en el Cantábrico, el Atlántico sur y Canarias.",
    published: "2026-07-08",
    readingMinutes: 8,
    intro:
      "Aprender a surfear depende menos de la ola perfecta y más de elegir una playa con fondo de arena, corrientes controladas y tamaño moderado. Estas son las playas de España donde ese equilibrio se da con más frecuencia, y cómo comprobar en dos minutos si hoy es un buen día para entrar.",
    takeaways: [
      "Busca fondo de arena, olas de 0,5–1 m y periodo corto o medio (7–11 s).",
      "La marea media suele ser la ventana más tolerante en la mayoría de playas del Cantábrico.",
      "Zarautz, Somo, Salinas, Pantín, El Palmar y Las Canteras concentran escuelas y olas asequibles.",
      "Antes de ir, revisa altura, periodo y viento: onshore fuerte estropea cualquier playa fácil.",
    ],
    sections: [
      {
        h2: "Qué hace que una playa sea buena para empezar",
        blocks: [
          {
            type: "p",
            text: "Una playa de iniciación no es la que tiene la mejor ola, sino la que perdona errores. Cuatro factores importan por encima del resto:",
          },
          {
            type: "list",
            items: [
              "Fondo de arena: menos riesgo al caer y olas más suaves al romper.",
              "Tamaño habitual entre 0,5 y 1 m, con periodo de 7 a 11 segundos.",
              "Corrientes identificables y zona de baño amplia para remar sin cruzarte con otros.",
              "Acceso fácil, escuelas cerca y socorristas en temporada.",
            ],
          },
        ],
      },
      {
        h2: "Comparativa de playas para aprender",
        blocks: [
          {
            type: "table",
            caption: "Playas de iniciación en España y sus condiciones típicas",
            head: ["Playa", "Zona", "Fondo", "Mejor marea", "Mejor época"],
            rows: [
              ["Zarautz", "País Vasco", "Arena", "Media", "Primavera y otoño"],
              ["Somo", "Cantabria", "Arena", "Media subiendo", "Todo el año"],
              ["Salinas", "Asturias", "Arena", "Media", "Otoño"],
              ["Pantín", "Galicia", "Arena", "Media bajando", "Verano y otoño"],
              ["El Palmar", "Andalucía", "Arena", "Media", "Otoño e invierno"],
              ["Las Canteras", "Canarias", "Arena", "Media alta", "Todo el año"],
            ],
          },
          {
            type: "p",
            text: "Las columnas de marea son orientativas: cada playa cambia con el tamaño del swell. Cuando el mar crece, la ventana de marea suele estrecharse.",
          },
        ],
      },
      {
        h2: "Cómo comprobar si hoy es buen día",
        blocks: [
          { type: "h3", text: "1. Mira la altura y el periodo" },
          {
            type: "p",
            text: "Si la previsión marca más de 1,5 m con periodo superior a 13 s, la playa que ayer era fácil hoy puede ser inasumible: el groundswell largo rompe con mucha más energía.",
          },
          { type: "h3", text: "2. Mira el viento" },
          {
            type: "p",
            text: "Onshore por encima de 20 km/h desordena la ola y complica la remada. Con viento flojo o de tierra, incluso un swell pequeño se surfea bien.",
          },
          { type: "h3", text: "3. Mira la marea" },
          {
            type: "p",
            text: "En playas de arena del Cantábrico, la marea media suele ofrecer olas más largas y menos cerradas que la baja viva.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cuántas clases necesito para ponerme de pie?",
        a: "Con dos o tres sesiones guiadas en espuma la mayoría de personas se levanta y desliza en línea recta. Surfear la pared de la ola y girar suele llevar una temporada completa de práctica regular.",
      },
      {
        q: "¿Qué tamaño de ola es seguro para un principiante?",
        a: "Entre 0,5 y 1 metro con periodo corto o medio. Por encima de 1,2 metros conviene tener ya control de la remada, la posición en el pico y la salida al canal.",
      },
      {
        q: "¿Se puede aprender a surfear en el Mediterráneo?",
        a: "Sí, aunque las olas son de viento, cortas y muy irregulares. Sirven para practicar remada y take off, pero las ventanas buenas duran pocas horas y dependen de temporales locales.",
      },
    ],
    related: [
      { label: "Guía: cómo leer previsiones de surf", to: "/blog/como-leer-previsiones-surf" },
      { label: "Surf en Cantabria", to: "/surf/cantabria" },
      { label: "Mapa de spots en tiempo real", to: "/spots" },
    ],
  },
  {
    slug: "cuando-hay-olas-en-espana",
    metaTitle: "Cuándo hay olas en España: calendario de swell por costa | SurfIA",
    metaDescription:
      "Mes a mes y costa a costa: cuándo entran los mejores swells en el Cantábrico, Galicia, Andalucía y Canarias, y qué tamaño y temperatura esperar.",
    h1: "Calendario de olas en España: qué costa funciona en cada mes",
    category: "Previsión",
    excerpt:
      "Las borrascas del Atlántico marcan la temporada. Este calendario resume qué esperar cada mes en cada costa para planificar viajes y sesiones.",
    published: "2026-07-15",
    readingMinutes: 7,
    intro:
      "El surf en España depende casi por completo de las borrascas del Atlántico norte. Saber cuándo se activan te permite planificar un viaje con semanas de antelación y elegir la costa correcta en lugar de improvisar.",
    takeaways: [
      "De octubre a marzo el Cantábrico y Galicia reciben los swells más consistentes.",
      "En verano, Canarias y las playas más expuestas de Galicia son la apuesta segura.",
      "Andalucía atlántica funciona con temporales de poniente, sobre todo en invierno.",
      "El viento local decide la sesión más que el tamaño del swell.",
    ],
    sections: [
      {
        h2: "Temporada por costa",
        blocks: [
          {
            type: "table",
            caption: "Consistencia esperable por costa y estación",
            head: ["Costa", "Otoño", "Invierno", "Primavera", "Verano"],
            rows: [
              ["País Vasco", "Alta", "Muy alta", "Media", "Baja"],
              ["Cantabria", "Alta", "Muy alta", "Media", "Baja"],
              ["Asturias", "Alta", "Alta", "Media", "Baja"],
              ["Galicia", "Muy alta", "Muy alta", "Alta", "Media"],
              ["Andalucía", "Media", "Alta", "Media", "Baja"],
              ["Canarias", "Alta", "Muy alta", "Media", "Media"],
            ],
          },
        ],
      },
      {
        h2: "Qué esperar mes a mes",
        blocks: [
          { type: "h3", text: "Septiembre a noviembre" },
          {
            type: "p",
            text: "El agua sigue templada y llegan los primeros groundswells largos. Es la mejor combinación del año para la mayoría de surfistas: olas de calidad sin el frío de enero.",
          },
          { type: "h3", text: "Diciembre a febrero" },
          {
            type: "p",
            text: "Máxima energía y también máxima probabilidad de días demasiado grandes o con viento. Las ensenadas protegidas ganan protagonismo frente a las playas abiertas.",
          },
          { type: "h3", text: "Marzo a mayo" },
          {
            type: "p",
            text: "Transición: quedan swells del norte y aumentan los días de viento flojo por la mañana. Buen momento para sesiones tempranas.",
          },
          { type: "h3", text: "Junio a agosto" },
          {
            type: "p",
            text: "Mar pequeño en el Cantábrico. Canarias mantiene oleaje del NE y Galicia recoge marejadas residuales en sus playas más expuestas.",
          },
        ],
      },
      {
        h2: "Cómo anticipar un buen fin de semana",
        blocks: [
          {
            type: "list",
            items: [
              "Revisa la previsión a 5–7 días y busca periodos crecientes por encima de 12 s.",
              "Comprueba la dirección: en el Cantábrico manda el NO, en Andalucía el O y SO.",
              "Cruza el swell con el viento previsto por franjas: la ventana buena suele ser al amanecer.",
              "Configura una alerta para tus spots y deja que te avise cuando se cumplan tus umbrales.",
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cuál es el mejor mes para surfear en España?",
        a: "Octubre y noviembre suelen ser los mejores meses: llegan swells largos del Atlántico norte y el agua todavía conserva temperatura del verano.",
      },
      {
        q: "¿Hay olas en España en verano?",
        a: "Sí, pero de forma irregular. Canarias mantiene oleaje casi todo el año y en la península funcionan las playas más expuestas de Galicia y algunos picos del Cantábrico con marejadas pequeñas.",
      },
      {
        q: "¿Qué grosor de neopreno necesito en cada época?",
        a: "En el Cantábrico, 4/3 mm con escarpines en invierno y 3/2 mm de mayo a octubre. En Canarias y Andalucía basta con 3/2 mm en invierno y lycra o 2 mm en verano.",
      },
    ],
    related: [
      { label: "Surf en Galicia", to: "/surf/galicia" },
      { label: "Crear una alerta de olas", to: "/alerts" },
      { label: "Guía: cómo leer previsiones de surf", to: "/blog/como-leer-previsiones-surf" },
    ],
  },
  {
    slug: "mareas-y-surf",
    metaTitle: "Mareas y surf: cómo afectan a la ola y cuándo entrar | SurfIA",
    metaDescription:
      "Cómo influye la marea en cada tipo de fondo, qué es el coeficiente y cómo calcular la mejor ventana para surfear en playas, puntas y arrecifes.",
    h1: "Cómo influye la marea en las olas (y cuándo conviene entrar)",
    category: "Previsión",
    excerpt:
      "Un mismo spot cambia por completo entre marea alta y baja. Aprende a leer el coeficiente y a elegir tu ventana de dos horas.",
    published: "2026-07-22",
    readingMinutes: 6,
    intro:
      "Dos surfistas pueden ver la misma previsión de olas y tener sesiones opuestas: uno entró con marea correcta y el otro no. La marea determina la profundidad sobre el fondo y, con ella, si la ola abre, cierra o directamente desaparece.",
    takeaways: [
      "En playas de arena, la marea media suele dar las olas más largas.",
      "Los arrecifes y puntas suelen necesitar más agua: marea media alta.",
      "Un coeficiente alto (>90) implica más corriente y cambios rápidos.",
      "La ventana útil real suele ser de unas dos horas alrededor de la marea óptima.",
    ],
    sections: [
      {
        h2: "Marea óptima según el fondo",
        blocks: [
          {
            type: "table",
            head: ["Tipo de fondo", "Marea recomendada", "Riesgo principal"],
            rows: [
              ["Playa de arena", "Media", "Olas cerradas en baja viva"],
              ["Punta de roca", "Media alta", "Poco fondo en baja"],
              ["Arrecife", "Alta o media alta", "Impacto contra el fondo"],
              ["Desembocadura / ría", "Media bajando", "Corriente de salida fuerte"],
            ],
          },
        ],
      },
      {
        h2: "Qué es el coeficiente de marea",
        blocks: [
          {
            type: "p",
            text: "El coeficiente mide la amplitud entre pleamar y bajamar en una escala aproximada de 20 a 120. Con coeficiente bajo (menos de 60) el nivel del mar se mueve poco y la ventana surfeable es amplia. Con coeficiente alto (más de 90), el agua sube y baja rápido: la ola puede pasar de perfecta a cerrada en menos de una hora.",
          },
          {
            type: "list",
            items: [
              "20–50: mareas muertas, cambios lentos, ventana larga.",
              "50–80: comportamiento estándar en la mayoría de spots.",
              "80–120: mareas vivas, mucha corriente, ventana corta y precisa.",
            ],
          },
        ],
      },
      {
        h2: "Cómo planificar tu ventana",
        blocks: [
          {
            type: "p",
            text: "Elige la hora de marea óptima del spot, réstale una hora y súmale otra: ese bloque de dos horas es tu sesión. Si además el viento es flojo o de tierra en esa franja, tienes la mejor combinación posible del día.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "¿Es mejor surfear con marea alta o baja?",
        a: "Depende del fondo. Las playas de arena suelen funcionar mejor con marea media, mientras que arrecifes y puntas de roca necesitan más agua y rinden con marea media alta.",
      },
      {
        q: "¿Cuánto dura la ventana buena de marea?",
        a: "Normalmente unas dos horas alrededor del punto óptimo. Con coeficientes altos puede reducirse a una hora escasa.",
      },
      {
        q: "¿El coeficiente alto significa olas más grandes?",
        a: "No. El coeficiente no genera oleaje, solo amplifica el rango de marea y la corriente. El tamaño lo determina el swell.",
      },
    ],
    related: [
      { label: "Guía: cómo leer previsiones de surf", to: "/blog/como-leer-previsiones-surf" },
      { label: "Surf en Asturias", to: "/surf/asturias" },
      { label: "Mapa de spots en tiempo real", to: "/spots" },
    ],
  },
  {
    slug: "como-elegir-tabla-de-surf",
    metaTitle: "Cómo elegir tabla de surf según nivel y olas | SurfIA",
    metaDescription:
      "Guía para elegir tabla de surf: litraje según peso y nivel, diferencias entre softboard, funboard, evolutiva y shortboard, y qué tabla usar en cada ola.",
    h1: "Elegir tu tabla de surf: litros, forma y tipo de ola",
    category: "Material",
    excerpt:
      "El error más común es bajar de litros demasiado pronto. Aquí tienes la tabla de litraje por peso y nivel, y qué shape encaja con las olas de España.",
    published: "2026-07-29",
    readingMinutes: 7,
    intro:
      "La tabla correcta multiplica tus olas por sesión; la incorrecta te deja remando. La decisión se reduce a tres variables: tu peso, tu nivel real y el tipo de ola que sueles surfear.",
    takeaways: [
      "Principiante: litros ≈ peso corporal × 1,0–1,3.",
      "Intermedio: peso × 0,6–0,8. Avanzado: peso × 0,35–0,5.",
      "En olas pequeñas y flojas, más volumen siempre gana.",
      "Cambia de tabla cuando cojas olas con constancia, no cuando te aburras.",
    ],
    sections: [
      {
        h2: "Cuántos litros necesitas",
        blocks: [
          {
            type: "table",
            caption: "Litraje orientativo según peso y nivel",
            head: ["Peso", "Principiante", "Intermedio", "Avanzado"],
            rows: [
              ["60 kg", "60–78 L", "36–48 L", "21–30 L"],
              ["70 kg", "70–91 L", "42–56 L", "25–35 L"],
              ["80 kg", "80–104 L", "48–64 L", "28–40 L"],
              ["90 kg", "90–117 L", "54–72 L", "32–45 L"],
            ],
          },
          {
            type: "p",
            text: "Si dudas entre dos valores, quédate con el mayor: rematar olas es lo que hace que mejores.",
          },
        ],
      },
      {
        h2: "Tipos de tabla y para qué sirven",
        blocks: [
          {
            type: "list",
            items: [
              "Softboard (7'–8'): primeras sesiones, espuma y seguridad.",
              "Evolutiva (6'6\"–7'6\"): transición, mucha remada y estabilidad.",
              "Funboard / mid-length (7'–8'): olas flojas y surf relajado.",
              "Shortboard (5'8\"–6'4\"): olas con pared, radios cortos, nivel medio-alto.",
              "Fish / retro (5'4\"–6'0\"): días pequeños y sin fuerza.",
            ],
          },
        ],
      },
      {
        h2: "Qué tabla usar en las olas de España",
        blocks: [
          {
            type: "p",
            text: "En el Cantábrico invernal, con swell largo y potente, una shortboard con algo de rocker responde mejor. En verano, con marejadas cortas y flojas, una fish o una mid-length te permitirá seguir surfeando días que de otro modo perderías.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué tabla comprar como primera tabla?",
        a: "Una softboard de 7 a 8 pies o una evolutiva con volumen igual o superior a tu peso corporal. Prioriza flotación y estabilidad frente a maniobrabilidad.",
      },
      {
        q: "¿Cuándo bajar de litros?",
        a: "Cuando cojas olas de forma constante, remes al pico sin fatiga y puedas hacer bottom turn y giro en la pared. Baja entre 3 y 5 litros por salto, nunca más.",
      },
      {
        q: "¿Sirve la misma tabla para todas las olas?",
        a: "Para empezar sí. A partir de nivel intermedio, tener dos tablas (una para días pequeños y otra para días con fuerza) marca más diferencia que cambiar de modelo.",
      },
    ],
    related: [
      { label: "Dónde aprender a surfear en España", to: "/blog/mejores-playas-para-aprender-a-surfear-en-espana" },
      { label: "Calendario de olas en España", to: "/blog/cuando-hay-olas-en-espana" },
      { label: "Mapa de spots en tiempo real", to: "/spots" },
    ],
  },
];

export const getPost = (slug?: string) => posts.find((p) => p.slug === slug);
