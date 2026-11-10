# Guía para la editora

Cómo mantener la web del club **sin programar**. El contenido se gestiona desde la carpeta **«Club del Último Miércoles» de Google Drive**, donde está la Sheet «CMS Club», y desde el panel `/admin` de la web. Los archivos (documentos, fotos) siguen en GitHub hasta que se active la subida desde la web.

## 0. Cómo entrar al panel (`/admin`)
1. Entra en la web con la misma cuenta de Google que figura en la pestaña **Equipo** de la Sheet.
2. Pulsa **Entrar con Google**. Si tu email no aparece en Equipo, verás un aviso: pide a la administradora que te añada.
3. En el panel verás las secciones **Peticiones**, **Libros**, **Sesiones**, **Propuestas**, **Textos** y, si eres administradora, **Equipo** y **Miembros**.
4. Cada cambio se guarda en la Sheet y queda en su historial de versiones (Archivo → Historial de versiones). Si algo sale mal, se puede restaurar.
5. El botón **Publicar ahora** actualiza la web pública en unos minutos. Sin pulsarlo, los cambios se publican solos cada 30 minutos.

**Peticiones**: es la bandeja central de solicitudes de los socios (propuestas, cambios de datos, pagos u otras). Cada petición tiene un estado (nueva, en curso, resuelta), un responsable y una respuesta. Se puede filtrar y buscar; no hace falta salir de la web para contestar.

**Miembros** (solo administración): dar de alta, cambiar la modalidad, bloquear o restablecer la contraseña. La contraseña temporal se comparte en persona o por WhatsApp; el miembro la cambia al entrar.

**Si no puedes entrar** o ves un error: anótalo y pásalo a la persona que mantiene la web. No compartas tu contraseña de Google con nadie.

> Hasta que esté activo el panel, las lecturas se editan en `data/seed-lecturas.csv` desde GitHub (§ 2), con las mismas columnas que la Sheet.

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
- **Borrar una opinión inadecuada**: mientras las valoraciones estén en Supabase, entra en https://supabase.com → proyecto `club-ultimo-miercoles` → **Table Editor** → tabla `valoraciones` → selecciona la fila → **Delete**. Desaparece de la web al momento (no hace falta publicar). Cuando se decida si migran a la Sheet, la moderación pasará a `/admin` (PLAN, Fase 2a).

## 6. Formularios, Instagram y Substack
- **Propuestas de lectura**: en Lecturas → Propuestas hay un formulario con el aspecto de la web, que se abre con el **código del club**. Las propuestas llegan a la pestaña `Propuestas` de la Sheet y a la bandeja de Peticiones. Para cambiar el código, pídelo a quien mantenga la web: el código nunca aparece en el repositorio. Comparte el código solo con el club.
- **Quiero ser del club** (en El club): quien lo rellena envía un email al correo del club con su nombre, apellidos, teléfono, una descripción y de parte de quién viene. La web no guarda nada.
- **Instagram**: la Galería muestra el perfil de @elultimomiercoles incrustado (las publicaciones se actualizan solas desde Instagram).
- **Substack**: el enlace está en El club (`site.substack` en `src/config/site.ts`).

## 7. Logo e imágenes de la web
- El logo original está en `assets-src/brand/`. Para cambiarlo, hay que sustituir esos PNG y regenerar los derivados (lo hace quien mantenga la web con `pnpm icons`).
- La imagen que aparece al compartir la web por WhatsApp es `public/brand/og/og-default.jpg` (se genera desde el logo).

## 8. Qué no hacer
- No subir nada privado: el repositorio es **público** (ni emails, ni listas de miembros, ni pagos, ni documentos internos).
- No editar otros archivos del repositorio. Si algo de la web tiene que cambiar, pídelo a quien la mantenga (o a Claude Code).
- No borrar líneas del CSV para ocultar libros: usa `visible = no`.

## 9. Pedir cambios a Claude Code
Describe el resultado que quieres, con la página y un ejemplo. Por ejemplo:
- «En la ficha de *Circe* la portada es de otra edición; usa la de Alianza.»
- «Añade en El club un apartado con las normas del club: …»
- «Las fotos de la sesión del 26 de noviembre están en `content/fotos/2025-11-26`; revisa que se vean bien.»
