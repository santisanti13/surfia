

## Plan: Mapa interactivo de spots + API AEMET + Sistema de alertas

### Resumen

Construir tres funcionalidades principales sobre el diseño actual de SURFIA:

1. **Mapa interactivo de spots de surf** con geolocalización del usuario
2. **Integración con API de AEMET** para condiciones meteorológicas en tiempo real (viento, oleaje, temperatura)
3. **Sistema de alertas personalizadas** para avisarte cuando hay buenas condiciones

### Requisitos previos

- **Lovable Cloud** (o Supabase): necesario para almacenar la API Key de AEMET de forma segura en una Edge Function, y para guardar las alertas de los usuarios
- **API Key de AEMET**: gratuita, se solicita en https://opendata.aemet.es/centrodedescargas/obtencionAPIkey
- **Librería de mapas**: Leaflet (gratuito, open source, ligero) via `react-leaflet`

### Arquitectura

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Frontend   │────▶│  Edge Function   │────▶│  AEMET API  │
│  (React +   │     │  (proxy seguro)  │     │  OpenData   │
│  Leaflet)   │     └──────────────────┘     └─────────────┘
│             │              │
│  GPS del    │     ┌──────────────────┐
│  navegador  │     │  Supabase DB     │
│             │────▶│  - spots         │
│             │     │  - user_alerts   │
└─────────────┘     └──────────────────┘
```

### Funcionalidades detalladas

#### 1. Página `/spots` - Mapa interactivo
- Mapa a pantalla completa con Leaflet + OpenStreetMap (gratis)
- Geolocalización del navegador (`navigator.geolocation`) para centrar el mapa
- Marcadores en spots de surf conocidos (base de datos de ~20-30 spots de España inicialmente)
- Al hacer clic en un marcador: panel lateral con condiciones actuales (datos AEMET)
- Filtros: distancia desde tu ubicación, calidad de olas, tipo de ola

#### 2. Edge Function `aemet-weather`
- Proxy seguro para la API de AEMET (la key no se expone al cliente)
- Endpoints AEMET a usar:
  - `/prediccion/especifica/playa/{playa_id}` - predicción de playas (oleaje, viento, UV, temp agua)
  - `/observacion/convencional/todas` - datos en tiempo real de estaciones
- Transforma los datos de AEMET a un formato limpio para el frontend

#### 3. Sistema de alertas
- El usuario configura alertas: "Avísame cuando haya olas > 1.5m en [spot]"
- Parámetros configurables: altura mínima de ola, viento máximo, dirección preferida
- Almacenamiento en Supabase (tabla `user_alerts`)
- Notificaciones via Web Notifications API del navegador
- Panel de "Mis Alertas" para gestionar las configuraciones

#### 4. Ideas adicionales que propongo
- **Puntuación IA del spot**: algoritmo que combina viento + oleaje + marea para dar una nota 1-10 de calidad
- **Histórico de condiciones**: gráficos de los últimos 7 días por spot (usando Recharts, ya instalado)
- **Spots favoritos**: guardar tus spots preferidos para acceso rápido

### Pasos de implementación

1. Habilitar Lovable Cloud / conectar Supabase
2. Crear tablas: `surf_spots` (nombre, lat, lng, playa_id_aemet) y `user_alerts`
3. Solicitar y almacenar API Key de AEMET como secret
4. Crear Edge Function `aemet-weather` como proxy
5. Instalar `react-leaflet` + `leaflet` y crear página `/spots` con mapa
6. Implementar geolocalización y marcadores de spots
7. Panel de detalle de spot con datos AEMET en tiempo real
8. Sistema de alertas con configuración y notificaciones
9. Añadir navegación desde la home al mapa

### Nota sobre AEMET

La API de AEMET cubre **solo España** (incluidas playas). Si quieres cobertura global, necesitaríamos una API adicional como Stormglass o Open-Meteo (también gratuita). Podemos empezar con España y expandir después.

