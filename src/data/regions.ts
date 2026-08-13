export interface RegionSpot {
  name: string;
  town: string;
  note: string;
}

export interface Region {
  slug: string;
  name: string;
  shortName: string;
  province: string;
  lat: number;
  lng: number;
  intro: string;
  bestSwell: string;
  bestWind: string;
  bestSeason: string;
  waterTemp: string;
  spots: RegionSpot[];
  faqs: { q: string; a: string }[];
}

export const regions: Region[] = [
  {
    slug: "pais-vasco",
    name: "País Vasco",
    shortName: "País Vasco",
    province: "Bizkaia y Gipuzkoa",
    lat: 43.35,
    lng: -2.7,
    intro:
      "La costa vasca concentra algunas de las olas más conocidas de Europa. Es una costa corta pero muy variada: izquierdas de fondo de arena y roca, playas urbanas fáciles y picos expuestos que aguantan swells grandes de Atlántico norte.",
    bestSwell: "NO – N",
    bestWind: "Sur (offshore)",
    bestSeason: "Octubre a marzo",
    waterTemp: "12–14 °C en invierno, 20–22 °C en verano",
    spots: [
      { name: "Mundaka", town: "Mundaka, Bizkaia", note: "Izquierda de fondo de arena en la ría de Urdaibai, muy dependiente de marea y de swell largo del NO." },
      { name: "Bakio", town: "Bakio, Bizkaia", note: "Playa abierta que recoge bastante swell; funciona con condiciones pequeñas cuando el resto está plano." },
      { name: "Sopelana", town: "Sopela, Bizkaia", note: "Varios picos en poca distancia, opción habitual cerca de Bilbao." },
      { name: "Zarautz", town: "Zarautz, Gipuzkoa", note: "Playa larga y tolerante, buena para iniciación e intermedios." },
      { name: "Zurriola", town: "Donostia-San Sebastián", note: "Playa urbana con acceso fácil y olas que aguantan viento moderado." },
    ],
    faqs: [
      { q: "¿Cuándo hay mejores olas en el País Vasco?", a: "Entre octubre y marzo, cuando las borrascas del Atlántico norte generan swells largos del NO. En verano el mar suele estar más pequeño y funcionan mejor las playas expuestas." },
      { q: "¿Dónde surfear en el País Vasco siendo principiante?", a: "Zarautz y la Zurriola son las opciones más habituales para iniciación por su fondo de arena, escuelas cercanas y olas más tolerantes con marea media." },
    ],
  },
  {
    slug: "cantabria",
    name: "Cantabria",
    shortName: "Cantabria",
    province: "Cantabria",
    lat: 43.42,
    lng: -3.9,
    intro:
      "Cantabria ofrece una costa muy accesible con playas abiertas, ensenadas protegidas y fondos de arena. Es una de las zonas con más alternativas de España: casi siempre hay un pico que funciona según la dirección del swell y del viento.",
    bestSwell: "NO – N",
    bestWind: "S – SO (offshore)",
    bestSeason: "Septiembre a abril",
    waterTemp: "13–15 °C en invierno, 20–22 °C en verano",
    spots: [
      { name: "Somo", town: "Ribamontán al Mar", note: "Arenal largo con varios picos, referencia para escuelas y sesiones de todos los niveles." },
      { name: "Los Locos", town: "Suances", note: "Pico potente con fondo de arena y roca, mejor con marea bajando." },
      { name: "Liencres", town: "Piélagos", note: "Playa abierta en entorno de dunas, recoge bien el swell del NO." },
      { name: "Langre", town: "Ribamontán al Mar", note: "Playa entre acantilados, más protegida de vientos del oeste." },
    ],
    faqs: [
      { q: "¿Qué playa de Cantabria es mejor para aprender a surfear?", a: "Somo es la referencia por su fondo de arena, olas más suaves en marea media y gran oferta de escuelas." },
      { q: "¿Se puede surfear en Cantabria en verano?", a: "Sí, aunque el oleaje suele ser más pequeño. Las playas más expuestas al NO son las que mantienen olas surfeables con swells cortos." },
    ],
  },
  {
    slug: "asturias",
    name: "Asturias",
    shortName: "Asturias",
    province: "Asturias",
    lat: 43.5,
    lng: -5.7,
    intro:
      "La costa asturiana combina playas de arena, desembocaduras y picos de roca. Es una costa larga con orientaciones muy distintas, así que casi siempre hay una playa a resguardo del viento dominante.",
    bestSwell: "NO – N",
    bestWind: "S (offshore)",
    bestSeason: "Octubre a abril",
    waterTemp: "12–14 °C en invierno, 19–21 °C en verano",
    spots: [
      { name: "Rodiles", town: "Villaviciosa", note: "Derecha clásica en la desembocadura de la ría, muy sensible a marea y a swell largo." },
      { name: "Salinas", town: "Castrillón", note: "Playa amplia con varios picos, funciona con casi cualquier tamaño." },
      { name: "San Lorenzo", town: "Gijón", note: "Playa urbana con acceso directo desde la ciudad." },
      { name: "Tapia de Casariego", town: "Tapia", note: "Zona del occidente asturiano con olas de calidad cuando entra swell del NO." },
    ],
    faqs: [
      { q: "¿Cuál es la mejor ola de Asturias?", a: "Rodiles es la más conocida por su derecha larga en la desembocadura de la ría de Villaviciosa, aunque necesita swell largo y la marea adecuada." },
      { q: "¿Hace falta neopreno para surfear en Asturias?", a: "Sí. En invierno se usa habitualmente 4/3 mm con escarpines, y en verano 3/2 mm." },
    ],
  },
  {
    slug: "galicia",
    name: "Galicia",
    shortName: "Galicia",
    province: "A Coruña y Pontevedra",
    lat: 43.0,
    lng: -9.0,
    intro:
      "Galicia es la zona de España que más energía del Atlántico recibe. Playas muy expuestas, aguas frías y olas potentes: una costa exigente pero con enorme consistencia durante todo el año.",
    bestSwell: "O – NO",
    bestWind: "E – SE (offshore)",
    bestSeason: "Todo el año, con máximo de octubre a marzo",
    waterTemp: "12–14 °C en invierno, 17–19 °C en verano",
    spots: [
      { name: "Pantín", town: "Valdoviño, A Coruña", note: "Playa de referencia internacional, con picos de calidad y mucha consistencia." },
      { name: "Doniños", town: "Ferrol", note: "Arenal expuesto que recoge todo el swell del Atlántico." },
      { name: "Razo", town: "Carballo", note: "Playa amplia y ventosa, popular también entre practicantes de deportes de viento." },
      { name: "A Lanzada", town: "O Grove / Sanxenxo", note: "Playa larga en las Rías Baixas, más protegida cuando el norte está demasiado grande." },
    ],
    faqs: [
      { q: "¿Es Galicia buena para surfear?", a: "Sí, es la costa española con más consistencia de oleaje, aunque también la más expuesta: conviene revisar el tamaño y las corrientes antes de entrar." },
      { q: "¿Dónde surfear en Galicia cuando hay demasiado swell?", a: "Las Rías Baixas y playas orientadas al sur, como A Lanzada, suelen filtrar parte de la energía cuando el norte está muy grande." },
    ],
  },
  {
    slug: "andalucia",
    name: "Andalucía",
    shortName: "Andalucía",
    province: "Cádiz y Huelva",
    lat: 36.3,
    lng: -6.1,
    intro:
      "El surf andaluz se concentra sobre todo en la provincia de Cádiz, donde el poniente genera oleaje y el levante limpia las olas. Agua más templada y menos días de swell que el norte, pero sesiones muy buenas en otoño e invierno.",
    bestSwell: "O – SO (poniente)",
    bestWind: "Levante (E, offshore)",
    bestSeason: "Noviembre a marzo",
    waterTemp: "15–17 °C en invierno, 21–23 °C en verano",
    spots: [
      { name: "El Palmar", town: "Vejer de la Frontera", note: "Playa de arena y referencia del surf gaditano, ideal con poniente y levante flojo." },
      { name: "Caños de Meca", town: "Barbate", note: "Zona con picos de roca y ambiente relajado junto al cabo de Trafalgar." },
      { name: "La Fontanilla", town: "Conil de la Frontera", note: "Playa accesible y tolerante, buena para iniciación." },
      { name: "Cortadura", town: "Cádiz", note: "Arenal urbano con varios picos y acceso sencillo desde la ciudad." },
    ],
    faqs: [
      { q: "¿Cuándo hay olas en Cádiz?", a: "Principalmente en otoño e invierno, cuando entran borrascas de poniente. El viento de levante es el que mejor forma la ola en la mayoría de playas gaditanas." },
      { q: "¿El Palmar es bueno para principiantes?", a: "En días pequeños y con marea adecuada sí; es una playa de arena con escuelas, pero con swell grande las corrientes aumentan." },
    ],
  },
  {
    slug: "canarias",
    name: "Canarias",
    shortName: "Canarias",
    province: "Islas Canarias",
    lat: 28.6,
    lng: -15.8,
    intro:
      "Canarias ofrece surf durante todo el año con agua templada. Predominan los fondos de roca y lava, con olas potentes en invierno y opciones más suaves en playas de arena para quienes empiezan.",
    bestSwell: "NO – N",
    bestWind: "Alisios variables según isla y orientación",
    bestSeason: "Octubre a abril",
    waterTemp: "19–20 °C en invierno, 23–24 °C en verano",
    spots: [
      { name: "Las Canteras", town: "Las Palmas de Gran Canaria", note: "Playa urbana protegida por la barra, con zonas aptas para iniciación." },
      { name: "El Confital", town: "Las Palmas de Gran Canaria", note: "Derecha de roca potente, solo para surfistas con experiencia." },
      { name: "La Santa", town: "Tinajo, Lanzarote", note: "Zona de olas potentes sobre fondo de lava, referencia del surf canario." },
      { name: "Famara", town: "Teguise, Lanzarote", note: "Arenal enorme y muy expuesto, con picos para distintos niveles." },
      { name: "El Socorro", town: "Los Realejos, Tenerife", note: "Playa clásica del norte de Tenerife, funciona con swell del NO." },
    ],
    faqs: [
      { q: "¿Se puede surfear todo el año en Canarias?", a: "Sí. El invierno concentra los swells más grandes del NO, pero durante el verano suele haber oleaje surfeable en las orientaciones adecuadas." },
      { q: "¿Qué neopreno necesito en Canarias?", a: "Con agua entre 19 y 24 °C, lo habitual es un 3/2 mm en invierno y lycra o shorty en verano." },
    ],
  },
];

export const getRegion = (slug?: string) => regions.find((r) => r.slug === slug);
