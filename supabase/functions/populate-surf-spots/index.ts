import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Comprehensive list of surf spots in Spain with AEMET beach IDs
const SPAIN_SURF_SPOTS = [
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
