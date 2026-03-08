

## Plan: Desarrollar los botones de la Home

### Botones identificados que necesitan mejora

1. **Hero CTA "Find Waves"** (línea 94) — Funciona pero el texto está en inglés y solo hay un botón. Añadir un segundo CTA secundario y traducir al español.

2. **"View All" en Trending Spots** (línea 127) — Es un `<button>` sin enlace real, no navega a ningún sitio. Convertirlo en un `<Link>` funcional a `/spots`.

3. **Sección Forecasting** — No tiene ningún CTA. Añadir un botón que lleve al mapa de spots.

4. **Footer links** — Los enlaces "About", "Privacy", "Terms", "Contact" apuntan a `#`. Dejarlos como están (no hay páginas para ellos) pero se pueden traducir.

### Cambios en `src/pages/Index.tsx`

1. **Hero**: Traducir "Find Waves" → "Explorar Spots". Añadir un segundo botón `variant="glass"` con texto "Ver Alertas" que enlace a `/alerts` (solo visible si hay usuario logueado, o siempre visible).

2. **Trending "View All"**: Cambiar el `<button>` por un `<Link to="/spots">` con estilos de botón para que sea navegable.

3. **Forecasting section**: Añadir un botón CTA al final de la columna izquierda (después de los features) que diga "Ver Previsiones" y enlace a `/spots`.

4. **Traducir textos** de sección al español: "Trending" → "Tendencia", "Top Spots" → "Mejores Spots", "Precision" → "Precisión", "Forecasting" → "Previsión", features en español.

### Archivos a modificar

- `src/pages/Index.tsx` — Todos los cambios anteriores

