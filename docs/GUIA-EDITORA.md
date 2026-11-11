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
2. En **Buscar en Google Libros** escribe el título (y el autor, si quieres) **o pega la dirección del libro en Google Libros** (por ejemplo `https://www.google.es/books/edition/…/ID`) y elige el libro: se rellenan solos el título, el autor, el ISBN y la ficha de Google, que da la portada, la sinopsis, el año y las páginas.
3. Elige el **Estado** (Próxima lectura, Leído, Propuesta o Por clasificar; este último no se publica), la **Fecha de la sesión** y, si quieres, una **Nota del club**. Con la fecha puesta, en Lecturas → Próximo sale una **cuenta atrás** (días y horas hasta las 19:30 de ese día, hora de Madrid), calculada en el momento en que se mira la web.
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

**Calendario.** En Lecturas › Próximo, la gente puede suscribirse al calendario del club (`/calendario.ics`) o añadir la sesión a Google Calendar. Cada sesión con **fecha** en la hoja es un evento a las 19:30 en la Librería Celama con el título del libro; al cambiar el libro o la fecha y publicar, los calendarios suscritos se actualizan solos (Google tarda hasta un día). Hora, duración y lugar están en `src/config/site.ts`.

## 2b. Propuestas y votación (cómo se elige la próxima lectura)
El club elige en **dos rondas**, todo desde la web y con el **código del club** (propiedad `CODIGO_CLUB` del script):

**Enlaces para WhatsApp** (los dos piden el código del club):
- `https://vmarhuendatn.github.io/clubdelultimomiercoles/proponer/`: solo el formulario de propuestas. En el panel, **Pedir propuestas** copia el mensaje con este enlace.
- `https://vmarhuendatn.github.io/clubdelultimomiercoles/votar/`: solo la votación (si no está abierta, lo dice). En la vista Votación, **Copiar mensaje para WhatsApp** copia el mensaje con las candidatas y este enlace.

1. **Propuestas.** Cada miembro propone (en `/proponer/` o en **Lecturas → Propuestas**) tres lecturas para una sesión (mes y año), más las del tintero que le apetezcan y por qué. Lo mismo que pedía el antiguo Google Form. Arriba salen las **recomendadas por el club** (un toque y van a la primera lectura libre); al escribir, la web sugiere recomendadas y tintero.
2. **Preparar la votación** (panel → **Propuestas**). Elige la **Sesión** y mira el **Resumen**, que funciona como un buscador:
   - Las cifras se pulsan para filtrar: **Libros distintos** (todos), **Coincidencias** (propuestos por varias personas), **Ya propuestos antes** (en otras sesiones) y **Personas** (lo que propuso cada una, agrupado).
   - El buscador encuentra un libro o una persona. Al pulsar un nombre ves todo lo que propuso esa persona; al pulsar uno de sus libros, vuelves a ese libro en la clasificación. **Quitar filtros** lo deja como al principio.
   - **Los más propuestos**: ordenados por personas que los proponen, con barra, puntos (3 si es la primera opción, 2 la segunda, 1 la tercera), quién lo propuso, si coincide con otras personas y si **ya se propuso en otras sesiones**.
   - **Lo más marcado del tintero** y aviso si alguien envió el formulario dos veces (cuenta una vez).
   - **Copiar resumen**: texto listo para pegar en WhatsApp.
   - Con **A votación** (solo administradoras) eliges las candidatas.
3. **Votación final** (panel → Propuestas → **Votación**). Con **Añadir otra candidata** (solo administradoras) puedes poner a votación un libro que nadie haya propuesto: búscalo en Google Libros o escribe título y autor. Pulsa **Abrir votación** y **Copiar mensaje para WhatsApp**: en la web, Lecturas → Propuestas pasa a «Vota la próxima lectura» y cada miembro puntúa las candidatas de 1 a 5 estrellas (si vota dos veces, cuenta su último voto). En el panel ves en directo la media, los votos, los puntos, el reparto de estrellas y **quién ha votado**. Cuando quieras, **Cerrar votación** y **Elegir** la ganadora: se abre la ficha de lectura ya como «Próxima lectura»; guarda y **Publicar ahora**.

4. **Archivar** cuando termine la sesión (solo administradoras): **Archivar sesión** junto al selector, o desde la vista **Archivo**. La sesión deja de salir en el selector y su votación se cierra; **no se borra nada**. En **Archivo** ves arriba las sesiones **en curso** y debajo el archivo **agrupado por años y meses**, con personas, libros, candidatas, votos y la ganadora de cada una. **Ver** la abre en el tablero (con un aviso de que está archivada) y **Desarchivar** la devuelve al selector. En la hoja, las filas archivadas llevan `archivada = si` en Propuestas y Votacion.

Otras vistas de Propuestas: **Personas** (cada envío con sus tres lecturas, tintero, motivo y estado: Nueva, En votación, Aceptada, Descartada) y **Tintero**.

**Errores** (cualquiera del equipo): en **Personas**, **Eliminar** borra una propuesta enviada por error; en **Votación › Quién ha votado**, la ✕ junto a un nombre borra su voto (todos sus envíos de esa sesión). Siempre pide confirmación. Si te equivocas, se recupera desde Archivo › Historial de versiones de la hoja. Para lo demás, mejor archivar que borrar.

**Tintero** (pestaña `Tintero` de la Sheet o panel → Propuestas → Tintero): las lecturas pendientes que salen en el desplegable del formulario. Cualquiera del equipo puede añadir; las administradoras **recomiendan** (salen las primeras en el formulario). Con `visible = no` se ocultan sin borrarlas.

**Dos clubs.** El club se reúne en dos grupos, **Club 1** y **Club 2**, que leen el mismo libro y tienen cada uno su quedada.
- El formulario de propuestas pregunta «¿De qué club eres?» (opciones en `gruposClub` y `clubs` de `src/config/site.ts`).
- En la ficha de lectura hay **Quedada del Club 1** y **Quedada del Club 2**. En Lecturas › Próximo salen las dos, la cuenta atrás va a la más cercana y cada club tiene su calendario (`/calendario-club-1.ics`, `/calendario-club-2.ics`).
- En **Inscritas**, cada persona lleva su club (obligatorio) y se filtra por club; quien propuso sin estar inscrita llega con su club puesto.
- En **Propuestas** y **Valoraciones**, el desplegable **Club** filtra todo; en «Por libro» se ven las medias de los dos clubs. En la hoja: `club` en Inscritas y Valoraciones, y `media_club_1` y `media_club_2` en Lecturas.

**Si no puedes entrar al panel** («No hemos podido conectar»), el aviso explica qué revisar. Lo habitual: varias cuentas de Google abiertas (prueba en una ventana privada con una sola), o la implementación del script sin acceso «Cualquier persona».

## 2b-bis. Inscritas (registro de personas del club)
1. Panel → **Inscritas**. Arriba, tres cifras que filtran la lista: **Inscritas** (activas), **De baja** y **Sin inscribir** (han enviado propuestas pero aún no están en el registro).
2. **Añadir inscrita** abre la ficha: nombre, apellidos, teléfono, email, estado (activa o de baja), ajuste de participaciones y notas. Desde «Sin inscribir», **Inscribir** abre la ficha con el nombre ya puesto.
3. **Participaciones**: el panel cuenta las sesiones en las que cada persona ha enviado propuestas, casando nombre y apellidos (sin importar tildes ni mayúsculas). Escribe los apellidos como los pone ella en el formulario.
4. **Ajuste**: si vino a sesiones sin proponer, o algo no cuadra, pon un número (2, o -1) en «Ajuste» desde el panel o en la columna `ajuste` de la pestaña **Inscritas** de la hoja. La columna `participaciones` = automáticas + ajuste.
5. Para dar de baja a alguien, pon **De baja** (no borres la fila). Son datos privados: nunca se publican en la web ni van a GitHub.

**Valoraciones** (panel → Inscritas → **Valoraciones**; cualquiera del equipo): las notas de 0 a 10 que cada persona da a la lectura al final de la sesión (las que Inés apunta en papel).
1. **Apuntar notas**: elige la lectura (sale primero la más reciente), escribe la nota de cada persona (7,5 vale) y **Guardar notas**. Deja vacío a quien no valoró; borrar una nota la quita. Arriba se ve la media mientras escribes.
2. **Por libro**: media de cada lectura y la nota de cada persona. **Por persona**: media de cada una y lo que puso a cada libro. En **Personas**, cada inscrita lleva su media.
3. En la hoja: pestaña **Valoraciones** (una fila por persona y lectura) y las columnas calculadas `valoraciones` y `media_valoraciones` (Inscritas) y `valoraciones_club` y `media_club` (Lecturas). Las medias son privadas: no salen en la web.

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

## 5. Valoraciones y opiniones (apagadas)
- **Hoy no se muestran** (decisión del club, noviembre de 2026): ni estrellas en las tarjetas ni sección de valoraciones ni «Entrar con Google» en las fichas. Para volver a activarlas, quien mantenga la web pone `funciones.valoraciones: true` en `src/config/site.ts`.
- Cuando estén activas: cualquiera con cuenta de Google puede valorar un libro (1 a 5 estrellas y una opinión). Se publica su nombre y la inicial del primer apellido; nunca el email.
- **Borrar una opinión inadecuada**: mientras las valoraciones estén en Supabase, entra en https://supabase.com → proyecto `club-ultimo-miercoles` → **Table Editor** → tabla `valoraciones` → selecciona la fila → **Delete**. Desaparece de la web al momento (no hace falta publicar). Cuando se decida si migran a la Sheet, la moderación pasará a `/admin` (PLAN, Fase 2a).

## 6. Formularios, Instagram y Substack
- **Propuestas de lectura**: ver § 2b. El código del club es la propiedad `CODIGO_CLUB` del Apps Script (Configuración del proyecto → Propiedades del script): para cambiarlo, basta con cambiarla ahí. Nunca aparece en el repositorio. Compártelo solo con el club.
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
