## Cómo publicar el proyecto en GitHub

No puedo crear el repo por ti — la conexión con GitHub la tiene que autorizar tu cuenta. Sigue estos pasos desde el editor de Lovable:

### Pasos

1. **Abre el menú de integraciones**
   - En el chat (abajo a la izquierda) pulsa el botón **+**.
   - Selecciona **GitHub** → **Connect project**.

2. **Autoriza la Lovable GitHub App**
   - Se abrirá GitHub en una pestaña nueva.
   - Inicia sesión si hace falta y pulsa **Authorize Lovable**.
   - Elige la cuenta u organización donde quieres alojar el repo.
   - Puedes dar acceso a *todos los repos* o solo *seleccionar repos* (recomendado: "All repositories" para que pueda crear el nuevo).

3. **Crea el repositorio**
   - Vuelve a Lovable. Verás el panel con tu cuenta/organización conectada.
   - Pulsa **Create Repository**.
   - Lovable creará el repo y subirá todo el código automáticamente.

4. **Listo — sincronización bidireccional activa**
   - Cualquier cambio que haga yo en Lovable se empuja a GitHub.
   - Cualquier commit que hagas tú en GitHub (local, PRs, etc.) vuelve a Lovable en tiempo real.

### Notas importantes

- Solo se puede conectar **una cuenta de GitHub** por cuenta de Lovable.
- Por ahora **no se pueden importar repos existentes** a un proyecto de Lovable — solo crear uno nuevo desde el proyecto.
- El repo se crea **privado** por defecto; puedes cambiarlo a público desde GitHub si quieres.
- Los datos de la base de datos **no se suben a GitHub** (solo el código). Para exportarlos: Cloud → Database → Tables → exportar CSV.

### Si algo falla

Dime exactamente qué mensaje ves (por ejemplo "no aparece mi organización", "error al autorizar", "no veo el botón Create Repository") y te ayudo a resolverlo.

¿Quieres que mientras tanto siga con alguna otra mejora del código (spots reales en la home, buscador global, perfil de usuario)?
