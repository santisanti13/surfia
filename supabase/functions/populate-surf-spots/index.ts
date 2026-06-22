import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Comprehensive list of surf spots in Spain.
// Spots with playa_id_aemet get both Stormglass (primary) and AEMET (fallback).
// Spots without playa_id_aemet rely on Stormglass marine data via lat/lng.
const SPAIN_SURF_SPOTS: Array<{ name: string; location: string; lat: number; lng: number; playa_id_aemet?: string; wave_type: string; difficulty: string }> = [
  // PAÍS VASCO
  { name: "Mundaka", location: "Vizcaya, País Vasco", lat: 43.4072, lng: -2.6981, playa_id_aemet: "4800301", wave_type: "point_break", difficulty: "expert" },
  { name: "Sopelana - La Salvaje", location: "Vizcaya, País Vasco", lat: 43.3835, lng: -2.9833, playa_id_aemet: "4800601", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Bakio", location: "Vizcaya, País Vasco", lat: 43.4314, lng: -2.8069, playa_id_aemet: "4800801", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Zarautz", location: "Guipúzcoa, País Vasco", lat: 43.2847, lng: -2.1694, playa_id_aemet: "2007901", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Zurriola", location: "Donostia, País Vasco", lat: 43.3267, lng: -1.9766, playa_id_aemet: "2001601", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Orrua", location: "Orio, País Vasco", lat: 43.2960, lng: -2.1252, playa_id_aemet: "2007801", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Laga", location: "Vizcaya, País Vasco", lat: 43.4167, lng: -2.6389, playa_id_aemet: "4800201", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Meñakoz", location: "Vizcaya, País Vasco", lat: 43.3961, lng: -2.9533, playa_id_aemet: "4800701", wave_type: "reef_break", difficulty: "expert" },
  
  // CANTABRIA
  { name: "Somo", location: "Ribamontán al Mar, Cantabria", lat: 43.4536, lng: -3.7375, playa_id_aemet: "3903001", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Liencres", location: "Piélagos, Cantabria", lat: 43.4705, lng: -3.9558, playa_id_aemet: "3903701", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Los Locos", location: "Suances, Cantabria", lat: 43.4385, lng: -4.0508, playa_id_aemet: "3904101", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Santa Marina", location: "Ribadesella, Cantabria", lat: 43.4411, lng: -3.8097, playa_id_aemet: "3903101", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Langre", location: "Ribamontán al Mar, Cantabria", lat: 43.4722, lng: -3.6811, playa_id_aemet: "3902801", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Oyambre", location: "San Vicente de la Barquera, Cantabria", lat: 43.3875, lng: -4.3556, playa_id_aemet: "3904801", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "El Sardinero", location: "Santander, Cantabria", lat: 43.4748, lng: -3.7847, playa_id_aemet: "3902601", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Noja", location: "Noja, Cantabria", lat: 43.4889, lng: -3.5222, playa_id_aemet: "3901801", wave_type: "beach_break", difficulty: "beginner" },

  // ASTURIAS
  { name: "Rodiles", location: "Villaviciosa, Asturias", lat: 43.5347, lng: -5.3778, playa_id_aemet: "3301401", wave_type: "point_break", difficulty: "intermediate" },
  { name: "Salinas", location: "Castrillón, Asturias", lat: 43.5778, lng: -5.9528, playa_id_aemet: "3302101", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "San Lorenzo", location: "Gijón, Asturias", lat: 43.5486, lng: -5.6528, playa_id_aemet: "3301701", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Tapia de Casariego", location: "Tapia de Casariego, Asturias", lat: 43.5711, lng: -6.9417, playa_id_aemet: "3302901", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Verdicio", location: "Gozón, Asturias", lat: 43.6175, lng: -5.8583, playa_id_aemet: "3302001", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Xagó", location: "Gozón, Asturias", lat: 43.6108, lng: -5.8917, playa_id_aemet: "3301901", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "España", location: "Villaviciosa, Asturias", lat: 43.5319, lng: -5.3542, playa_id_aemet: "3301301", wave_type: "beach_break", difficulty: "advanced" },
  { name: "Frejulfe", location: "Navia, Asturias", lat: 43.5550, lng: -6.7194, playa_id_aemet: "3302801", wave_type: "beach_break", difficulty: "intermediate" },

  // GALICIA
  { name: "Pantín", location: "Valdoviño, A Coruña", lat: 43.5931, lng: -8.1750, playa_id_aemet: "1502001", wave_type: "beach_break", difficulty: "advanced" },
  { name: "Razo", location: "Carballo, A Coruña", lat: 43.3031, lng: -8.6583, playa_id_aemet: "1504801", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Baldaio", location: "Carballo, A Coruña", lat: 43.3117, lng: -8.6389, playa_id_aemet: "1504701", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Doniños", location: "Ferrol, A Coruña", lat: 43.4919, lng: -8.3444, playa_id_aemet: "1501301", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Patos", location: "Nigrán, Pontevedra", lat: 42.1444, lng: -8.8278, playa_id_aemet: "3600801", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Lariño", location: "Carnota, A Coruña", lat: 42.8167, lng: -9.0833, playa_id_aemet: "1506901", wave_type: "beach_break", difficulty: "advanced" },
  { name: "Montalvo", location: "Sanxenxo, Pontevedra", lat: 42.3861, lng: -8.8222, playa_id_aemet: "3601401", wave_type: "beach_break", difficulty: "beginner" },
  { name: "A Frouxeira", location: "Valdoviño, A Coruña", lat: 43.6197, lng: -8.1528, playa_id_aemet: "1502101", wave_type: "beach_break", difficulty: "intermediate" },

  // ANDALUCÍA
  { name: "El Palmar", location: "Vejer de la Frontera, Cádiz", lat: 36.2250, lng: -6.0639, playa_id_aemet: "1101901", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Zahara de los Atunes", location: "Barbate, Cádiz", lat: 36.1361, lng: -5.8583, playa_id_aemet: "1101501", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Tarifa", location: "Tarifa, Cádiz", lat: 36.0139, lng: -5.6056, playa_id_aemet: "1101201", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Los Caños de Meca", location: "Barbate, Cádiz", lat: 36.1842, lng: -5.9583, playa_id_aemet: "1101701", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Cortadura", location: "Cádiz, Cádiz", lat: 36.4847, lng: -6.2611, playa_id_aemet: "1102301", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Bolonia", location: "Tarifa, Cádiz", lat: 36.0861, lng: -5.7722, playa_id_aemet: "1101301", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "La Barrosa", location: "Chiclana, Cádiz", lat: 36.3553, lng: -6.1917, playa_id_aemet: "1102101", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Roche", location: "Conil de la Frontera, Cádiz", lat: 36.2906, lng: -6.1167, playa_id_aemet: "1102001", wave_type: "beach_break", difficulty: "intermediate" },

  // CANARIAS
  { name: "El Confital", location: "Las Palmas de Gran Canaria", lat: 28.1653, lng: -15.4414, playa_id_aemet: "3500101", wave_type: "reef_break", difficulty: "expert" },
  { name: "Famara", location: "Teguise, Lanzarote", lat: 29.1039, lng: -13.5556, playa_id_aemet: "3501201", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "El Quemao", location: "La Santa, Lanzarote", lat: 29.0500, lng: -13.6333, playa_id_aemet: "3501101", wave_type: "reef_break", difficulty: "expert" },
  { name: "Las Américas", location: "Arona, Tenerife", lat: 28.0569, lng: -16.7306, playa_id_aemet: "3800601", wave_type: "reef_break", difficulty: "advanced" },
  { name: "El Lloret", location: "Telde, Gran Canaria", lat: 27.9722, lng: -15.3722, playa_id_aemet: "3500601", wave_type: "reef_break", difficulty: "advanced" },
  { name: "Maspalomas", location: "San Bartolomé de Tirajana, Gran Canaria", lat: 27.7417, lng: -15.5861, playa_id_aemet: "3500901", wave_type: "beach_break", difficulty: "beginner" },
  { name: "La Cicer - Las Canteras", location: "Las Palmas de Gran Canaria", lat: 28.1442, lng: -15.4381, playa_id_aemet: "3500201", wave_type: "reef_break", difficulty: "intermediate" },
  { name: "El Cotillo", location: "La Oliva, Fuerteventura", lat: 28.6861, lng: -14.0167, playa_id_aemet: "3502001", wave_type: "reef_break", difficulty: "advanced" },
  { name: "Playa del Inglés", location: "San Bartolomé de Tirajana, Gran Canaria", lat: 27.7583, lng: -15.5750, playa_id_aemet: "3500801", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Bajamar", location: "San Cristóbal de La Laguna, Tenerife", lat: 28.5483, lng: -16.3472, playa_id_aemet: "3800101", wave_type: "reef_break", difficulty: "advanced" },
  { name: "El Médano", location: "Granadilla de Abona, Tenerife", lat: 28.0444, lng: -16.5389, playa_id_aemet: "3800501", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "La Cícer", location: "Las Palmas de Gran Canaria", lat: 28.1450, lng: -15.4385, playa_id_aemet: "3500201", wave_type: "beach_break", difficulty: "beginner" },

  // MEDITERRÁNEO - VALENCIA / CATALUÑA
  { name: "La Patacona", location: "Alboraya, Valencia", lat: 39.4897, lng: -0.3278, playa_id_aemet: "4600701", wave_type: "beach_break", difficulty: "beginner" },
  { name: "El Saler", location: "Valencia, Valencia", lat: 39.3583, lng: -0.3083, playa_id_aemet: "4601001", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Castelldefels", location: "Castelldefels, Barcelona", lat: 41.2619, lng: 1.9861, playa_id_aemet: "0801601", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Barceloneta", location: "Barcelona, Barcelona", lat: 41.3792, lng: 2.1922, playa_id_aemet: "0801001", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Ocata", location: "El Masnou, Barcelona", lat: 41.4781, lng: 2.3111, playa_id_aemet: "0800801", wave_type: "beach_break", difficulty: "beginner" },

  // MURCIA
  { name: "Calblanque", location: "Cartagena, Murcia", lat: 37.5667, lng: -0.7222, playa_id_aemet: "3000601", wave_type: "beach_break", difficulty: "intermediate" },

  // HUELVA
  { name: "Mazagón", location: "Moguer, Huelva", lat: 37.1308, lng: -6.8278, playa_id_aemet: "2100801", wave_type: "beach_break", difficulty: "intermediate" },
  { name: "El Rompido", location: "Cartaya, Huelva", lat: 37.2000, lng: -7.1278, playa_id_aemet: "2100501", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Isla Cristina", location: "Isla Cristina, Huelva", lat: 37.1944, lng: -7.3194, playa_id_aemet: "2100301", wave_type: "beach_break", difficulty: "beginner" },
  { name: "Matalascañas", location: "Almonte, Huelva", lat: 36.9861, lng: -6.5639, playa_id_aemet: "2101001", wave_type: "beach_break", difficulty: "intermediate" },

  // ===== EXTRA SPOTS (Stormglass-only) =====
  // PAÍS VASCO extra
  { name: "Ereaga", location: "Getxo, Vizcaya", lat: 43.3525, lng: -3.0214, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Plentzia", location: "Plentzia, Vizcaya", lat: 43.4108, lng: -2.9544, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Barinatxe (La Salvaje)", location: "Sopelana, Vizcaya", lat: 43.3850, lng: -2.9889, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Ogeia", location: "Ispaster, Vizcaya", lat: 43.3742, lng: -2.5564, wave_type: "reef_break", difficulty: "advanced" },
  { name: "Roca Puta", location: "Sopelana, Vizcaya", lat: 43.3878, lng: -2.9722, wave_type: "reef_break", difficulty: "expert" },
  { name: "Hendaya (frontera)", location: "Hondarribia, Guipúzcoa", lat: 43.3722, lng: -1.7972, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Gaztetape", location: "Getaria, Guipúzcoa", lat: 43.3025, lng: -2.2031, wave_type: "reef_break", difficulty: "expert" },
  { name: "Roka Puta - Punta Galea", location: "Getxo, Vizcaya", lat: 43.3789, lng: -3.0364, wave_type: "reef_break", difficulty: "expert" },
  { name: "Deba", location: "Deba, Guipúzcoa", lat: 43.2950, lng: -2.3500, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Saturraran", location: "Mutriku, Guipúzcoa", lat: 43.3050, lng: -2.4039, wave_type: "beach_break", difficulty: "intermediate" },

  // CANTABRIA extra
  { name: "El Brusco", location: "Noja, Cantabria", lat: 43.4950, lng: -3.5689, wave_type: "beach_break", difficulty: "advanced" },
  { name: "Berria", location: "Santoña, Cantabria", lat: 43.4742, lng: -3.4683, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Loredo", location: "Ribamontán al Mar, Cantabria", lat: 43.4592, lng: -3.7222, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Tagle (El Madero)", location: "Suances, Cantabria", lat: 43.4456, lng: -4.0683, wave_type: "reef_break", difficulty: "advanced" },
  { name: "Usil", location: "Miengo, Cantabria", lat: 43.4458, lng: -3.9925, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Valdearenas", location: "Piélagos, Cantabria", lat: 43.4717, lng: -3.9633, wave_type: "beach_break", difficulty: "intermediate" },

  // ASTURIAS extra
  { name: "Vega", location: "Ribadesella, Asturias", lat: 43.4742, lng: -5.1339, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Aguilar", location: "Muros de Nalón, Asturias", lat: 43.5708, lng: -6.0958, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Otur", location: "Valdés, Asturias", lat: 43.5733, lng: -6.4889, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Cuevas del Mar", location: "Llanes, Asturias", lat: 43.4500, lng: -4.9056, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Penarronda", location: "Castropol, Asturias", lat: 43.5650, lng: -7.0500, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Bayas", location: "Castrillón, Asturias", lat: 43.5839, lng: -6.0036, wave_type: "beach_break", difficulty: "intermediate" },

  // GALICIA extra
  { name: "Nemiña", location: "Muxía, A Coruña", lat: 43.0167, lng: -9.2333, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Traba", location: "Laxe, A Coruña", lat: 43.2389, lng: -8.9667, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Caión", location: "A Laracha, A Coruña", lat: 43.3047, lng: -8.6125, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Malpica", location: "Malpica de Bergantiños, A Coruña", lat: 43.3231, lng: -8.8092, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Soesto", location: "Laxe, A Coruña", lat: 43.2356, lng: -9.0167, wave_type: "beach_break", difficulty: "advanced" },
  { name: "Carnota", location: "Carnota, A Coruña", lat: 42.8333, lng: -9.0917, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Furnas", location: "Porto do Son, A Coruña", lat: 42.7333, lng: -9.0500, wave_type: "beach_break", difficulty: "advanced" },
  { name: "Area Maior - Louro", location: "Muros, A Coruña", lat: 42.7625, lng: -9.1056, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Coído de Cuño", location: "Muxía, A Coruña", lat: 43.0500, lng: -9.2500, wave_type: "reef_break", difficulty: "advanced" },
  { name: "O Rostro", location: "Fisterra, A Coruña", lat: 42.9417, lng: -9.2833, wave_type: "beach_break", difficulty: "advanced" },

  // ANDALUCÍA extra
  { name: "Castilnovo", location: "Conil, Cádiz", lat: 36.2611, lng: -6.0967, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Yerbabuena", location: "Barbate, Cádiz", lat: 36.1750, lng: -5.9333, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Punta Paloma", location: "Tarifa, Cádiz", lat: 36.0625, lng: -5.7283, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Valdevaqueros", location: "Tarifa, Cádiz", lat: 36.0550, lng: -5.7081, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Los Lances", location: "Tarifa, Cádiz", lat: 36.0211, lng: -5.6228, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Fuente del Gallo", location: "Conil, Cádiz", lat: 36.2783, lng: -6.1006, wave_type: "beach_break", difficulty: "intermediate" },

  // CANARIAS extra
  { name: "La Caleta", location: "La Caleta, Tenerife", lat: 28.1186, lng: -16.7861, wave_type: "reef_break", difficulty: "advanced" },
  { name: "Igueste", location: "Santa Cruz, Tenerife", lat: 28.5333, lng: -16.1750, wave_type: "reef_break", difficulty: "expert" },
  { name: "La Izquierda - Fuerteventura", location: "La Oliva, Fuerteventura", lat: 28.7333, lng: -14.0083, wave_type: "reef_break", difficulty: "expert" },
  { name: "Punta Blanca", location: "La Oliva, Fuerteventura", lat: 28.7194, lng: -14.0250, wave_type: "reef_break", difficulty: "advanced" },
  { name: "Majanicho", location: "La Oliva, Fuerteventura", lat: 28.7472, lng: -13.9667, wave_type: "reef_break", difficulty: "advanced" },
  { name: "Lobos", location: "Isla de Lobos, Fuerteventura", lat: 28.7400, lng: -13.8181, wave_type: "point_break", difficulty: "advanced" },
  { name: "La Pared", location: "Pájara, Fuerteventura", lat: 28.2125, lng: -14.2331, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "Esquinzo", location: "Pájara, Fuerteventura", lat: 28.1850, lng: -14.2611, wave_type: "beach_break", difficulty: "intermediate" },
  { name: "San Juan", location: "La Santa, Lanzarote", lat: 29.0444, lng: -13.6611, wave_type: "reef_break", difficulty: "expert" },
  { name: "La Caleta de Famara", location: "Teguise, Lanzarote", lat: 29.1147, lng: -13.5664, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Las Cucharas", location: "Costa Teguise, Lanzarote", lat: 29.0286, lng: -13.5097, wave_type: "reef_break", difficulty: "intermediate" },
  { name: "La Derecha de los Alemanes", location: "La Santa, Lanzarote", lat: 29.0489, lng: -13.6594, wave_type: "reef_break", difficulty: "expert" },
  { name: "Las Palmeras", location: "Las Palmas, Gran Canaria", lat: 28.1467, lng: -15.4356, wave_type: "reef_break", difficulty: "intermediate" },
  { name: "El Frontón", location: "Gáldar, Gran Canaria", lat: 28.1583, lng: -15.6692, wave_type: "reef_break", difficulty: "expert" },
  { name: "La Guancha", location: "Bañaderos, Gran Canaria", lat: 28.1583, lng: -15.5333, wave_type: "reef_break", difficulty: "advanced" },

  // MEDITERRÁNEO extra
  { name: "Pukas Surf Eskola - Somo", location: "Somo, Cantabria", lat: 43.4525, lng: -3.7286, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Pinedo", location: "Valencia", lat: 39.4136, lng: -0.3208, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Gavà", location: "Gavà, Barcelona", lat: 41.2697, lng: 2.0314, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Sitges", location: "Sitges, Barcelona", lat: 41.2347, lng: 1.8089, wave_type: "beach_break", difficulty: "beginner" },
  { name: "Cabrera de Mar", location: "Cabrera de Mar, Barcelona", lat: 41.5208, lng: 2.3958, wave_type: "beach_break", difficulty: "beginner" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let inserted = 0;
    let skipped = 0;

    for (const spot of SPAIN_SURF_SPOTS) {
      // Check if spot already exists by playa_id_aemet or by name+location
      const { data: existing } = await supabase
        .from("surf_spots")
        .select("id")
        .or(`playa_id_aemet.eq.${spot.playa_id_aemet},and(name.eq.${spot.name},location.eq.${spot.location})`)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing with AEMET data
        await supabase
          .from("surf_spots")
          .update({
            playa_id_aemet: spot.playa_id_aemet,
            lat: spot.lat,
            lng: spot.lng,
            wave_type: spot.wave_type,
            difficulty: spot.difficulty,
            source: "aemet",
          })
          .eq("id", existing[0].id);
        skipped++;
      } else {
        // Insert new spot
        const { error } = await supabase.from("surf_spots").insert({
          name: spot.name,
          location: spot.location,
          lat: spot.lat,
          lng: spot.lng,
          playa_id_aemet: spot.playa_id_aemet,
          wave_type: spot.wave_type,
          difficulty: spot.difficulty,
          source: "aemet",
          approved: true,
        });
        if (!error) inserted++;
        else console.error(`Error inserting ${spot.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        updated: skipped,
        total: SPAIN_SURF_SPOTS.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
