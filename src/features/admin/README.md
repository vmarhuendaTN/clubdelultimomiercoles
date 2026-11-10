Panel del equipo en `/back/` (admin y editora). Entra con Google; Apps Script (`apps-script/Code.gs`)
comprueba la sesión y el rol en la pestaña Equipo en cada llamada.

- `services/api.ts`: llamadas al script (lecturas por JSONP, escrituras por POST + resultado; ver `src/lib/apps-script`).
- `hooks/use-sesion-equipo.ts`: sesión de 6 h guardada en `localStorage`.
- Secciones: Lecturas (alta y edición con buscador de Google Libros), Propuestas (estado y «Añadir a lecturas»),
  Equipo (solo admin) y «Publicar ahora».
