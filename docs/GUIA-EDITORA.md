# Guía para la editora

Cómo mantener la web del club **sin programar**. Todo se hace desde la web de GitHub (repositorio `vmarhuendaTN/clubdelultimomiercoles`) y, para las valoraciones, desde Supabase.

> Cuando esté lista la Fase 3, las lecturas, sesiones y textos se editarán en una Google Sheet («CMS Club») y esta guía cambiará. Hasta entonces, se usa el archivo `data/seed-lecturas.csv`, que tiene las mismas columnas.

---

## 1. Cómo se publica
- Cada cambio que guardas en GitHub (**Commit changes**) publica la web sola en unos **3 minutos**.
- Para ver si ha terminado: pestaña **Actions** → «Publicar en GitHub Pages». Verde = publicado; rojo = algo falló (avisa a quien mantenga la web).
- Para volver a publicar sin cambiar nada: Actions → «Publicar en GitHub Pages» → **Run workflow**.
- La web: https://vmarhuendatn.github.io/clubdelultimomiercoles/

## 2. Añadir o cambiar una lectura
1. En GitHub, abre `data/seed-lecturas.csv` y pulsa el lápiz (**Edit this file**).
2. Cada línea es un libro. Las columnas, en este orden:

| Columna | Qué poner |
|---|---|
| `titulo`, `autor` | obligatorias, tal como queráis que se vean |
| `estado` | `leido`, `proximo`, `propuesta` o `por_clasificar` (este último no se publica) |
| `orden` | número; los leídos se muestran del mayor al menor |
| `fecha_sesion` | `AAAA-MM-DD` (opcional; si la hay, las lecturas se agrupan por año) |
| `isbn` | opcional |
| `google_books_id` | opcional: fija la edición exacta (ver § 3) |
| `portada_manual` | opcional: dirección (URL) de una imagen de portada |
| `descripcion_manual` | opcional: sinopsis propia (sustituye a la de Google) |
| `nota_club` | opcional: comentario del club, se ve en la ficha |
| `visible` | `si` o `no` (con `no` se oculta sin borrarlo) |
| `revisar` | nota interna para recordar que hay que comprobar algo; no se publica |

3. Ejemplo de línea nueva:
   `Pedro Páramo,Juan Rulfo,proximo,26,,,,,,,si,`
4. Si un campo lleva **comas**, ponlo entre comillas: `"Tragedias: Antígona, Edipo Rey",Sófocles,leido,…`
5. Pulsa **Commit changes**. En unos minutos el libro aparece en `/lecturas`, con su portada, sinopsis y datos de Google Books (si la clave de Google Books está guardada en GitHub; si no, aparece con una portada ilustrada y los datos se completan cuando alguien la añada).

## 3. La portada o la edición no es la buena
- **Elegir otra edición de Google Libros**: busca el libro en https://books.google.com, abre la edición correcta y copia lo que va después de `id=` en la dirección (por ejemplo `SIkmSgAACAAJ`). Pégalo en la columna `google_books_id` de ese libro.
- **Poner tu propia portada**: sube la imagen a la carpeta `content/portadas/` con el nombre del libro tal como aparece en su dirección web. Por ejemplo, la ficha `…/lecturas/la-maldicion-de-hill-house/` → `content/portadas/la-maldicion-de-hill-house.jpg`. Gana siempre a la de Google.
- **Libros pendientes de revisar**: al publicar, el paso «Build estático» de Actions lista los libros dudosos («revisar «…»: …»). Hoy son, entre otros, los que no tienen portada en Google en español.

## 4. Documentos, fotos y portadas (carpeta `content/`)
Todo lo que se sube aquí es **público**. Instrucciones detalladas en `content/README.md`.
- **Documentos PDF** → `content/documentos/` (se ven en `/documentos/`).
- **Fotos de una sesión** → `content/fotos/AAAA-MM-DD/` (se ven en `/galeria/`). Se les quita la ubicación GPS automáticamente. Solo fotos con permiso de quien aparece.
- **Portadas propias** → `content/portadas/` (ver § 3).

Para subir: entra en la carpeta → **Add file → Upload files** → arrastra → **Commit changes**.

## 5. Valoraciones y opiniones
- Cualquiera con cuenta de Google puede valorar un libro (1 a 5 estrellas y una opinión). Se publica su nombre y la inicial del primer apellido; nunca el email.
- **Borrar una opinión inadecuada**: entra en https://supabase.com → proyecto `club-ultimo-miercoles` → **Table Editor** → tabla `valoraciones` → selecciona la fila → **Delete**. Desaparece de la web al momento (no hace falta publicar).
- Cuando exista el panel `/admin`, se podrá moderar desde la propia web.

## 6. Logo e imágenes de la web
- El logo original está en `assets-src/brand/`. Para cambiarlo, hay que sustituir esos PNG y regenerar los derivados (lo hace quien mantenga la web con `pnpm icons`).
- La imagen que aparece al compartir la web por WhatsApp es `public/brand/og/og-default.jpg` (se genera desde el logo).

## 7. Qué no hacer
- No subir nada privado: el repositorio es **público** (ni emails, ni listas de miembros, ni pagos, ni documentos internos).
- No editar otros archivos del repositorio. Si algo de la web tiene que cambiar, pídelo a quien la mantenga (o a Claude Code).
- No borrar líneas del CSV para ocultar libros: usa `visible = no`.

## 8. Pedir cambios a Claude Code
Describe el resultado que quieres, con la página y un ejemplo. Por ejemplo:
- «En la ficha de *Circe* la portada es de otra edición; usa la de Alianza.»
- «Añade en El club un apartado con las normas del club: …»
- «Las fotos de la sesión del 26 de noviembre están en `content/fotos/2025-11-26`; revisa que se vean bien.»
