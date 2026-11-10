# Guía para la editora

Cómo mantener la web del club **sin programar**. Las lecturas y las propuestas se gestionan desde el **panel de la web** (`/back/`), que guarda todo en la Sheet **«CMS Club»** de Google Drive. Los archivos (documentos, fotos) siguen en GitHub (§ 4).

## 0. Cómo entrar al panel (`/back/`)
1. Abre https://vmarhuendatn.github.io/clubdelultimomiercoles/back/ (mejor guárdalo en favoritos: no sale en el menú).
2. Pulsa **Iniciar sesión con Google** con la cuenta que figura en la pestaña **Equipo** de la Sheet. Si no estás, verás un aviso: pide a una administradora que te añada.
3. La sesión dura 6 horas en ese navegador. **Salir** la cierra.
4. Arriba está **Publicar en la web** y, debajo, las pestañas **Lecturas**, **Propuestas** y, si eres administradora, **Equipo**.
5. Todo lo que guardas va a la Sheet y queda en su historial (Archivo → Historial de versiones). Si algo sale mal, se puede restaurar desde ahí.

**Si no puedes entrar** o ves un error que no se arregla con «Reintentar»: anótalo y pásalo a quien mantenga la web. No compartas tu contraseña de Google con nadie.

---

## 1. Cómo se publica
- Lo que guardas en el panel está **en la hoja al momento**, pero la web pública se rehace al pulsar **Publicar ahora** (tarda unos **3 minutos**). Si nadie lo pulsa, se publica sola **cada noche**.
- La tarjeta «Publicar en la web» dice cuándo fue la última publicación y si salió bien; «Ver detalles en GitHub» lleva al registro.
- Si la hoja no responde al publicar, **no se publica nada** y la web sigue como estaba (nunca sale vacía).
- Los cambios en GitHub (`content/`, código) también publican la web solos en unos 3 minutos.
- La web: https://vmarhuendatn.github.io/clubdelultimomiercoles/

## 2. Añadir o cambiar una lectura
1. Panel → **Lecturas** → **Añadir lectura** (o pulsa una lectura de la lista para editarla).
2. En **Buscar en Google Libros** escribe el título (y el autor, si quieres) y elige el libro: se rellenan solos el título, el autor, el ISBN y la ficha de Google, que da la portada, la sinopsis, el año y las páginas.
3. Elige el **Estado** (Próxima lectura, Leído, Propuesta o Por clasificar; este último no se publica), la **Fecha de la sesión** y, si quieres, una **Nota del club**.
4. **Guardar**. Después, **Publicar ahora**.

Para ocultar un libro sin borrarlo: «Visible en la web» → **No**. En la lista, el filtro **Mostrar** enseña solo las próximas, leídas, ocultas, etc.

En **Más opciones** están el orden (los leídos se muestran del mayor al menor), el ISBN, el ID de Google Libros, una portada propia (enlace `https://…`) y una sinopsis propia. Lo que pongas a mano gana siempre a lo automático.

También se puede editar directamente en la pestaña **Lecturas** de la Sheet (mismas columnas). No toques la columna `id`: el panel la usa para saber qué fila es cada libro. `data/seed-lecturas.csv` de GitHub queda solo como copia de respaldo.

| Columna | Qué poner |
|---|---|
| `titulo`, `autor` | obligatorias, tal como queráis que se vean |
| `estado` | `leido`, `proximo`, `propuesta` o `por_clasificar` (este último no se publica) |
| `orden` | número; los leídos se muestran del mayor al menor |
| `fecha_sesion` | `AAAA-MM-DD` (opcional; si la hay, las lecturas se agrupan por año) |
| `isbn`, `google_books_id` | opcionales: fijan la edición exacta (ver § 3) |
| `portada_manual` | opcional: dirección (URL) de una imagen de portada |
| `descripcion_manual` | opcional: sinopsis propia (sustituye a la de Google) |
| `nota_club` | opcional: comentario del club, se ve en la ficha |
| `visible` | `si` o `no` (con `no` se oculta sin borrarlo) |
| `revisar` | nota interna; no se publica |
| `id`, `actualizado_en`, `actualizado_por` | las rellena el panel; no se publican |

## 2b. Propuestas de lectura
- Los socios proponen en **Lecturas → Propuestas** de la web, con el **código del club**. El formulario es de la propia web y pide lo mismo que el antiguo Google Form: nombre, apellidos, grupo, mes y año de la sesión, **tres lecturas**, lecturas en el tintero (opcional) y por qué (opcional).
- Cada envío es una fila de la pestaña `Propuestas` de la Sheet y aparece en el panel → **Propuestas**, con las tres lecturas numeradas.
- Cambia el **Estado** (Nueva, En votación, Aceptada, Descartada): se guarda al momento.
- **Añadir** junto a cada lectura abre el formulario de lectura con ese título; usa el buscador para completar la ficha.
- Las opciones de «¿De qué grupo eres?» se fijan en la web (`gruposClub` en `src/config/site.ts`); mientras esté vacío, es un campo de texto libre.

## 2c. Equipo (solo administradoras)
- Panel → **Equipo**: añade a alguien con el email de su cuenta de Google, su nombre y su rol (Editora o Administradora). Puede entrar al momento.
- **Quitar** le corta el acceso al momento. No puedes quitarte a ti misma y siempre queda al menos una administradora.

## 3. La portada o la edición no es la buena
- **Elegir otra edición de Google Libros**: edita la lectura en el panel y vuelve a buscarla en «Buscar en Google Libros»; elige la edición buena. A mano: busca el libro en https://books.google.com, abre la edición correcta y copia lo que va después de `id=` (por ejemplo `SIkmSgAACAAJ`) en «Más opciones → ID de Google Libros».
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
- **Propuestas de lectura**: ver § 2b. Para cambiar el código del club, pídelo a quien mantenga la web (hay que cambiarlo en dos sitios: la web y la propiedad `CODIGO_CLUB` del script). El código nunca aparece en el repositorio. Compártelo solo con el club.
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
