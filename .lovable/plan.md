

## SEO & GEO Optimization for Surfia

### Title & Description

**Title (60 chars):**
`Surfia — Previsión de Olas y Surf en Tiempo Real | Alertas Cerca de Ti`

**Meta Description (155 chars):**
`Consulta la previsión de olas, viento y marejada en tiempo real. Recibe alertas de surf según tu ubicación. Encuentra los mejores spots cerca de ti con Surfia.`

### Changes to implement

**1. `index.html`** — Update all meta tags:
- `<html lang="es">` (target audience is Spanish)
- `<title>` with SEO-optimized title
- `<meta name="description">` with geo-targeted description
- Add `<meta name="keywords">` with surf-related Spanish keywords
- Add geo meta tags: `geo.region`, `geo.placename`, `geo.position`
- Update `og:title`, `og:description`, `og:locale`
- Add `twitter:title`, `twitter:description`
- Add canonical URL placeholder

**2. `src/pages/Index.tsx`** — Update visible hero text:
- Hero subtitle to include geo-relevant keywords naturally (e.g., "Previsión de olas en tiempo real cerca de ti")

**3. `public/robots.txt`** — Add sitemap reference (already allows all bots, which is good)

This is purely a metadata and copy update — no structural or logic changes needed.

