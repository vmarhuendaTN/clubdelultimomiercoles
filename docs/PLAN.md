# Plan de desarrollo — web del Club del Último Miércoles

Objetivo: una web tipo app con catálogo automático de lecturas (portadas y sinopsis de Google Books), valoraciones, galería con Instagram, área de miembros y contenido editable sin programar. Código en GitHub (repo público), publicada en GitHub Pages como web estática, preparada para abrirse al público en `www.clubultimomiercoles.es`.

Backend decidido (octubre–noviembre 2026): **Google Drive + Google Apps Script**, sin Supabase para el panel, la sesión de los miembros ni el contenido. Inés (directora) trabaja en una carpeta de Drive con su Google Sheet. Coste: 0 €.

Leyenda: **[H]** = tarea humana (cuentas, claves, pagos). **[CC]** = tarea para Claude Code. Las casillas reflejan el estado real: márcalas al terminar.

---

## Estado actual (noviembre 2026)

| Área | Estado |
|---|---|
| Web publicada | ✅ GitHub Pages, despliegue en cada push a `main` |
| Sistema de diseño, PWA, CI (lint, tipos, tests, axe) | ✅ Fase 1 completa |
| Logo definitivo y todos sus derivados | ✅ `pnpm icons` |
| Lecturas (`/lecturas`) y ficha de libro con datos de Google Books | ✅ 25 leídas + próxima (*Sinsonte*); 21 con portada real (fuente: `data/seed-lecturas.csv`) |
| Valoraciones con estrellas y opiniones (login con Google) | ⏸ apagadas por decisión del club (`site.funciones.valoraciones`); el código sigue en `features/reviews` |
| Galería (Instagram en carrusel + fotos de sesiones) | ✅ página · ⏳ Instagram sin conectar (Fase 5) |
| Subidas públicas desde GitHub (`content/`) | ✅ documentos, fotos, portadas |
| El club, Documentos, Inicio | ✅ con textos provisionales; falta «Próxima sesión» |
| Backend en Drive + Apps Script (Sheet CMS: Léeme, Lecturas, Propuestas, Equipo) | ✅ código y hoja · ⏳ volver a implementar el script y sus propiedades [H] |
| Sync de la Sheet al sitio público | ✅ `pnpm sync` en cada publicación («Publicar ahora» y cada noche); el CSV queda de respaldo |
| Panel del equipo `/back/` | ✅ Lecturas (con buscador de Google Libros), Propuestas, Equipo y «Publicar ahora» |
| Área de miembros | ⏳ Fases 2 y 2b |
| Legales, SEO, dominio | ⏳ Fases 6 y 7 |

**Siguiente paso recomendado**: volver a implementar el Apps Script con `apps-script/Code.gs` y rellenar sus propiedades (ver `apps-script/README.md`). Después, área de miembros (Fase 2).

---

## Arquitectura

```
 Google Drive — carpeta «Club del Último Miércoles» (la gestiona Inés)
 ┌──────────────────────────────┐        ┌────────────────────────────────────────────┐
 │ Sheet «CMS Club»             │◀──────▶│ Apps Script (Web App, ejecutado como Inés) │
 │  Lecturas · Sesiones · Textos│        │  · API pública: contenido publicado (JSON) │
 │  Equipo · Miembros           │        │  · API privada: login admin/editora (Google)│
 │  Peticiones · Propuestas     │        │    y miembros (contraseña con hash y sal)   │
 │ Carpeta «Subidas» (privada)  │        │  · Publicar ahora → GitHub Actions          │
 └──────────────────────────────┘        └───────────────┬────────────────────────────┘
                                                         │ JSON público (cada 30 min o «Publicar ahora»)
 GitHub Actions                                          ▼
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ sync.yml   → descarga el JSON público de Apps Script → src/generated/           │
 │ pages.yml  → pnpm content + pnpm books + next build (export) → GitHub Pages ✅  │
 │ instagram.yml (cada 6 h) → Fase 5                                                │
 └─────────────────────────────────────────────────────────────────────────────────┘

 Repositorio (hoy) ─ data/seed-lecturas.csv · data/google-books.json · content/   (respaldo de la Sheet)

 Navegador ── web estática (GitHub Pages) ── /admin y /miembros ──▶ Apps Script (API privada, sesión)
```

Por qué así:
- **Todo el contenido vive en Drive**: Inés ve las peticiones, respuestas y textos en el mismo sitio donde ya trabaja, y puede corregir a mano en la hoja si hace falta.
- **Web estática en GitHub Pages**: gratis, rápida y sin servidor propio. Lo público se incrusta en el build; lo privado nunca se incrusta, se pide a Apps Script con sesión válida.
- **Apps Script como único intermediario**: se ejecuta como la cuenta de Inés, así que no hacen falta cuentas de servicio ni claves de Google en GitHub. Es gratuito y sus cuotas sobran para un club de lectura.
- **Fichas de Google Books guardadas en el repo** (`data/google-books.json`): la web no depende de Google en cada publicación y no gasta cuota.

## Despliegue en GitHub Pages
- Exportación estática de Next.js (`out/`) publicada por `.github/workflows/pages.yml` en cada push a `main` (o a mano: Actions → «Publicar en GitHub Pages» → Run workflow).
- Sin dominio, vive en `https://vmarhuendatn.github.io/clubdelultimomiercoles/` (`basePath` = `/clubdelultimomiercoles`).
- Lo **público** (lecturas, fichas, textos) se incrusta en el HTML en el build. Lo **privado** nunca: se pide a Apps Script desde el navegador, con sesión verificada en cada llamada.
- Sin previews por PR: el CI (`ci.yml`) valida cada PR con lint, tipos, tests unitarios, recursos y e2e con axe.

---

## Fase 0 — Cuentas y claves [H]
- [x] **GitHub**: repo público `vmarhuendaTN/clubdelultimomiercoles` con `CLAUDE.md`, `docs/`, `data/seed-lecturas.csv` y el logo en `assets-src/brand/`.
- [x] **GitHub Pages**: Source = GitHub Actions.
- [x] **Google Books**: clave de API creada.
- [ ] **Google Books**: restringir la clave a «Books API» y guardarla como secreto `GOOGLE_BOOKS_API_KEY` del repo (Settings → Secrets and variables → Actions → *Secrets*).
- [ ] **Carpeta de Drive**: crear «Club del Último Miércoles» en la cuenta de Inés (o del club) y compartirla con una segunda persona con acceso de administración (ver riesgos).
- [x] **Sheet CMS**: «CMS Club» con las pestañas Léeme, Lecturas (las 81 del CSV, con `id`), Propuestas y Equipo. Las copias antiguas (`seed-lecturas`, `seed-lecturas-google`) y las respuestas del Google Form (vacías) ya no se usan.
- [ ] **Apps Script**: crear el proyecto desde la propia Sheet (Extensiones → Apps Script), desplegarlo como Aplicación web («Ejecutar como: yo»; acceso «Cualquier persona») y guardar su URL como variable `APPS_SCRIPT_URL`. Propiedades del script (no en el código): `SHEET_ID`, `GH_DISPATCH_TOKEN`, `GH_REPO`.
- [ ] **GitHub token para «Publicar ahora»**: token fino (fine-grained) solo con permiso *Actions: write* sobre este repo, guardado como propiedad del script. Nunca en el repo ni en la web.
- [ ] **Login de Google para Equipo** (Fase 2): el proyecto de Apps Script necesita el ámbito de identidad; se aprueba en el primer despliegue.
- [ ] **Instagram (Fase 5)**: `@elultimomiercoles` como cuenta profesional; app en developers.facebook.com con *Instagram API con inicio de sesión de Instagram*; token de larga duración.
- [ ] **Valoraciones**: decidir si migran a la Sheet (ver Fase 2a). Si se mantiene Supabase para ellas, sigue la configuración de Google en Supabase ya descrita abajo.
  - [ ] [H] Pantalla de consentimiento OAuth y ID de cliente web (solo si se mantiene Supabase): redirección `https://voplbvbfuxgweyzarqzl.supabase.co/auth/v1/callback`; Site URL y Redirect URLs de la web en Supabase.

## Fase 1 — Esqueleto, arquitectura y sistema de diseño [CC] ✅
- [x] Next.js 15 + TypeScript estricto + ESLint (jsx-a11y, imports entre features) + Stylelint (prohíbe valores sin token) + Prettier + pnpm.
- [x] Estructura de carpetas de `CLAUDE.md`.
- [x] Recursos según `docs/ASSETS.md`; scripts `pnpm assets` y `pnpm icons`; comprobación en CI.
- [x] Logo definitivo del club (textura de cera) y derivados: variantes WebP claro/oscuro/isotipo, favicons, iconos PWA, og-image, logos para emails.
- [x] `src/styles/` con tokens, reset, base, layout y utilidades; modo claro y oscuro.
- [x] Inter y Caveat (y Newsreader) alojadas en el repo con `next/font/local` (Google Fonts fallaba a veces en el build).
- [x] `components/ui` y `components/layout` (ver catálogo en `docs/DISENO.md` § 4).
- [x] `features/books`: BookCover (2:3, portada ilustrada de respaldo), BookCard, BookCarousel.
- [x] PWA: manifest, iconos (maskable y apple-touch-icon), `theme-color` claro/oscuro, service worker.
- [x] GitHub Actions: `ci.yml` y `pages.yml`.
- [x] Página `/estilo` según `docs/DISENO.md` § 7.

## Fase 2 — Acceso: Equipo (admin/editora) y Miembros [CC]
Dos tipos de acceso, ambos verificados por Apps Script en cada llamada:

- **Equipo (admin y editora)**: entran con su cuenta de Google. Apps Script comprueba que el email figura en la pestaña **Equipo** con rol `admin` o `editora`. Los demás emails reciben un 403.
- **Miembros**: entran con **email + contraseña**. La contraseña se guarda solo como hash con sal en la pestaña **Miembros**; Apps Script limita los intentos fallidos (5 cada 15 minutos por email) y nunca devuelve el hash. Las altas las hace la editora desde `/admin`, que genera una contraseña temporal que se comparte en persona o por WhatsApp.

> Nota de seguridad: SHA-256 con sal es más débil que bcrypt, pero Apps Script no ofrece bcrypt. Para un club amateur con contraseñas propias y límite de intentos es razonable; si el club crece o hay datos sensibles, reconsiderar Supabase Auth.

Pestañas de la Sheet que usa esta fase (ver § Plantilla): `Equipo`, `Miembros`.

- [ ] Apps Script: funciones `iniciarSesion(email, contraseña)` y `iniciarSesionGoogle()` (ID token de Google verificado), sesión en `CacheService` con caducidad de 8 h.
- [ ] Apps Script: `altaMiembro`, `bloquearMiembro` (`activo=no`) y `restablecerContraseña` (genera temporal y la marca para cambio al entrar). Nunca borrar filas automáticamente.
- [ ] Rutas `/admin/entrar` y `/miembros/entrar`; sin middleware (web estática). `RequireAuth` en los layouts de `(miembros)` y `(admin)`. Es solo experiencia de uso: **la seguridad la da Apps Script**.
- [ ] Pestaña «Perfil» o «Entrar» en la TabBar cuando exista el área.
- [ ] Formularios con el aspecto de la web (`features/forms`), enviados a Apps Script; las respuestas quedan en la Sheet.

**Hecho cuando**: Playwright cubre entrar como miembro, entrar como editora, acceso denegado sin sesión, acceso denegado a `/admin` con rol miembro y bloqueo tras cinco intentos fallidos.

## Fase 2a — Valoraciones de lecturas [CC] ✅ código · ⏳ decisión [H]
Cualquiera con cuenta de Google puede poner de 1 a 5 estrellas y una opinión a cada lectura; las opiniones son públicas.
- [x] Migración `supabase/migrations/20261009120000_valoraciones.sql`: tabla `valoraciones` (una por persona y libro) y vista `valoraciones_resumen`. RLS: lectura pública; escritura solo de la propia; los anónimos no ven `user_id`.
- [x] Autor y nombre público («Nombre I.», inicial del primer apellido) fijados por trigger desde la cuenta de Google; el email nunca se publica.
- [x] `features/reviews`: sección «Valoraciones» en la ficha (media, opiniones, estrellas accesibles, editar/borrar) y media en las tarjetas de `/lecturas`. `features/auth`: entrar con Google (PKCE) y salir.
- [ ] [H] **Decidir**: (a) migrar valoraciones a una pestaña `Valoraciones` de la Sheet, con el mismo login de Google de Apps Script, y retirar Supabase del proyecto (recomendado: un único backend); o (b) mantener Supabase solo para esta función, con su pausa por inactividad del plan gratuito.
- [ ] Moderación desde `/admin` (hoy: Supabase → Table Editor → `valoraciones`).
- [x] Explicar las valoraciones en `/privacidad` (nombre visible, email no, borrado a petición) y enlazarla desde el aviso de acceso.

## Fase 2b — Subida de archivos [CC]
**Desde GitHub ✅** — carpeta `content/` (ver `content/README.md`), todo **público**. `scripts/build-content.ts` lo procesa en cada build (nombres normalizados, fotos a WebP sin EXIF/GPS, portadas con LQIP). Se ve en `/documentos/`, `/galeria/` y en las portadas.

**Desde la web** — `/admin/subir`, solo `admin`/`editora`:
- [ ] Pestaña `Subidas` en la Sheet (`tipo`, `titulo`, `visibilidad` `publico`/`miembros`, `archivo_id`, `sesion_fecha`, `libro_slug`, `bytes`, `subido_por`, `creado_en`).
- [ ] Dos carpetas de Drive: «Subidas públicas» (se copian al repo en el siguiente build) y «Subidas de miembros» (solo accesibles por Apps Script).
- [ ] Formulario con arrastrar y soltar y selector **Público / Solo miembros**; fotos reducidas y sin EXIF **en el navegador** antes de subir (límite de Apps Script: 50 MB por archivo).
- [ ] Lo de miembros se descarga solo tras una sesión válida, mediante un enlace temporal generado por Apps Script.
- [ ] Gestión: listar, renombrar, cambiar visibilidad y borrar.

## Fase 3 — Sincronización de la Sheet con la web pública [CC]
Núcleo de la autonomía de la editora.

Ya hecho (adelantado para ver las lecturas):
- [x] `src/lib/books-api` según `docs/GOOGLE-BOOKS.md`: intentos de búsqueda (con texto libre de último recurso), puntuación con topes, ficha completa por id, portada y sinopsis de respaldo de otra edición fiable, separación de citas de prensa, reintentos y cuota. Con tests.
- [x] `src/lib/sheets`: lector de CSV y esquema Zod de la pestaña Lecturas (las filas con errores se informan, no rompen nada).
- [x] `scripts/build-books.ts`: lecturas desde `data/seed-lecturas.csv`, fichas guardadas en `data/google-books.json` por `hash_origen`, reintento a las 24 h de los libros sin resultado, informe de libros a revisar.

Pendiente:
- [x] Apps Script: endpoint público `?accion=publico` que devuelve las Lecturas visibles (sin quién las editó). Sesiones y Textos, cuando existan sus pestañas.
- [x] `scripts/sync-hoja.ts` (`pnpm sync`, dentro de `pages.yml`, que se lanza con «Publicar ahora», con cada push y cada noche): descarga el JSON público, lo valida con Zod y lo deja en `src/generated/hoja-lecturas.json`. Si la hoja falla, el despliegue se detiene y la web publicada sigue igual. (Sin `sync.yml` aparte: un solo workflow.)
- [ ] Portadas: `COVERS_MODE=remote` (hoy) — las portadas siguen enlazadas desde Google; no hay almacenamiento propio.
- [x] Botón **Publicar ahora** de `/back/`: llama a Apps Script, que dispara `workflow_dispatch` con el token guardado en sus propiedades, y muestra el estado de la última publicación.
- [ ] Miembros: alta, bloqueo y cambio de rol desde `/admin` (en la Sheet). Nunca borrar usuarios automáticamente.

**Hecho cuando**: con la Sheet real, las ~80 lecturas se publican con portada y sinopsis, y el informe lista las que necesitan revisión.

## Fase 4 — Páginas [CC]
Públicas:
- [ ] `/` Inicio: logo y «Lo último que hemos leído» **hechos** (sin claim, por decisión del club); falta la tarjeta «Próxima sesión» (fecha, libro, lugar, «Añadir al calendario» `.ics`) y «Cómo funciona».
- [x] `/lecturas`: control segmentado (próximo / leídos / propuestas; se abre en Próximo), próxima lectura destacada, rejilla y buscador en Leídos, agrupación por año (cuando haya `fecha_sesion`), media de valoraciones; maqueta revisada en escritorio.
- [x] Propuestas: formulario propio de la web (sin Google Forms ni iframe), con las mismas preguntas que el antiguo Google Form (nombre, apellidos, grupo, mes y año, tres lecturas, tintero y por qué), protegido con el código del club (lo comprueba solo Apps Script con `CODIGO_CLUB`). Recomendadas por el club (chips) y tintero como desplegable que va quitando lo elegido. Las respuestas llegan a la pestaña `Propuestas` de la Sheet.
- [x] `/lecturas/[slug]`: portada sobre su color, edición, sinopsis con «Leer más», «Lo que dice la crítica», ficha técnica, nota del club, valoraciones, enlaces a Google Libros y a la librería, atribución.
- [x] `/galeria` (pestaña): Instagram (perfil incrustado, se carga al pedirlo; carrusel con la API en la Fase 5) y fotos de sesiones.
- [x] `/el-club` (textos provisionales hasta la pestaña Textos), Substack, «Quiero ser del club» (email preparado) y `/documentos`.
- [x] `/privacidad`: política según RGPD, LOPDGDD y LSSI (responsable, finalidades y bases, plazos, encargados y transferencias, derechos y AEPD, menores, cookies). Única página legal del pie, por decisión del club (sin aviso legal, cookies ni accesibilidad: no hay cookies y las cuestiones se resuelven en privacidad). Debe citar ahora Google (Drive y Apps Script) como encargado.
- [x] Pie compacto: nombre, «Escríbenos», Instagram y Privacidad (sin dirección).

Área de miembros:
- [ ] `/miembros`: próxima sesión con notas internas, recordatorio de pago y cancelaciones, grupo de WhatsApp.
- [ ] `/miembros/sesiones`: histórico. `/miembros/perfil`: datos propios y cambio de contraseña.

Admin / editora (`/back/`; antes previsto en `/admin`), con la misma imagen de la web:
- [ ] Bandeja **Peticiones**: lista con estados (nueva, en curso, resuelta), búsqueda, filtros y respuesta desde la propia web (se guarda en la Sheet).
- [x] Libros: alta y edición con validación (cliente y script) y buscador de Google Libros que rellena la ficha.
- [ ] Sesiones y Textos: edición con validación y vista previa.
- [x] Propuestas: cambio de estado (nueva, en votación, aceptada, descartada) y «Añadir» cada lectura propuesta a Lecturas.
- [x] Tintero en su propia pestaña de la hoja (sale de Lecturas); las administradoras lo recomiendan desde el panel.
- [x] Tablero de propuestas por sesión: cifras, clasificación con puntos (3-2-1) y proponentes, coincidencias, repetidas de otras sesiones, envíos duplicados, tintero marcado y «Copiar resumen».
- [x] Enlaces propios `/votar/` y `/proponer/` (con el código) y mensajes listos para WhatsApp desde el panel; candidatas libres añadidas por la admin; Resumen filtrable (cifras pulsables, buscador, agrupación por persona).
- [x] Cuenta atrás en «Próximo» hasta la sesión (fecha de la próxima lectura, 19:30 hora de Madrid; `site.sesion`).
- [x] Archivo de sesiones: archivar/desarchivar desde el panel (Apps Script v7, `sesion.archivar`, columna `archivada`), vista Archivo con las sesiones en curso y el archivo agrupado por años y meses.
- [x] Aviso en el panel si el script de la hoja es más antiguo que la web, y diagnóstico para administradoras (propiedades que faltan, error exacto de Google Libros). Apps Script v8.
- [x] Inscritas: registro de personas del club en la hoja (nombre, apellidos, teléfono, email, alta, activa, notas) con participaciones calculadas por sesiones con propuesta y `ajuste` manual; sección «Inscritas» en el panel con buscador, bajas e «Inscribir» a quien ha propuesto sin estar. Apps Script v9.
- [x] Votación final (segunda ronda): la admin elige candidatas y abre la votación; el club puntúa de 1 a 5 estrellas con el código; resultados en directo (media, votos, puntos, reparto, quién ha votado) y «Elegir» como próxima lectura. Pestañas `Votacion` y `Votos`.
- [x] Rediseño: títulos en serif (Newsreader), superficies con filete, `ListaAgrupada`, El club con «Cómo funciona», panel con la misma cabecera que la web.
- [ ] [H] Opciones de «¿De qué grupo eres?» (`site.gruposClub`); hasta entonces, texto libre.
- [x] Equipo: altas, roles y bajas (solo admin; siempre queda una admin y nadie se quita a sí misma).
- [ ] Miembros: altas, roles y bloqueos.
- [ ] Publicar ahora, estado del último sync, libros a revisar con sus candidatos, moderación de valoraciones, estado del token de Instagram.

- [ ] Transiciones de portada con View Transitions.

**Hecho cuando**: Lighthouse ≥ 95 en accesibilidad y ≥ 90 en rendimiento en móvil; axe sin errores; Core Web Vitals en verde; prueba con VoiceOver y teclado.

## Fase 5 — Instagram [CC]
- [x] `InstagramCarousel` en `/galeria`: lee `src/generated/instagram.json`; sin datos invita a seguir la cuenta.
- [ ] `src/lib/instagram-api`: `GET /me/media` (últimas 12), copiar imágenes (las URL de Meta caducan).
- [ ] `.github/workflows/instagram.yml` cada 6 h: refresca y **renueva el token** si le quedan < 15 días.
- [ ] Si falla la API: mostrar las últimas guardadas y avisar en `/admin`.
- Plan B sin app de Meta: widget de Behold.so en el mismo hueco.

## Fase 6 — Calidad, SEO y legal [CC]
- [ ] Metadatos por página y og-image por libro.
- [ ] `sitemap.xml` y `robots.txt` según `SITE_MODE`.
- [ ] Datos estructurados `Book` y `Organization`.
- [x] Página 404 con el sillón del logo.
- [x] «Estamos leyendo» (logo completo sobre fondo neutro): página de error de la web (`app/error.tsx`) y `index.html` de respaldo en la raíz del repositorio, por si GitHub Pages publica el repositorio en vez de la web (evita que se vea el README).
- [x] Logos definitivos: cabecera (`logo-cabecera-transparente.png`) y pie (`logo-footer-transparente.png`), con versión oscura.
- [x] Galería: Instagram incrustado sin aviso previo, por decisión del club (explicado en `/privacidad`).
- [ ] Auditoría WCAG 2.2 AA completa.
- [ ] Tests visuales de regresión (capturas a 390 y 1440 px).
- [ ] Prueba de instalación como app en iPhone y Android.
- [ ] Copia de seguridad: la Sheet se exporta a `.xlsx` cada semana (Archivo → Descargar) y se guarda en la carpeta de Drive del club.

## Fase 7 — Dominio y apertura al público [H + CC]
- [ ] [H] Comprar `clubultimomiercoles.es` (titular con NIF/NIE).
- [ ] [H] DNS a GitHub Pages (CNAME de `www` a `vmarhuendatn.github.io` y registros A del raíz), dominio en Settings → Pages, HTTPS.
- [ ] [CC] `BASE_PATH` vacío y `SITE_URL` nuevo (variables de Actions) y URL de la Web App de Apps Script actualizada en el CORS del script.
- [ ] [CC] `SITE_MODE=public`, quitar `noindex`, sitemap en Search Console.

## Fase 8 — Ideas para después (no empezar sin confirmar)
- Votación de propuestas en la web (sustituyendo la del WhatsApp).
- Inscripción a sesiones con plazas.
- Calendario `.ics` suscribible.
- Newsletter con la próxima lectura.

---

## Plantilla de la Sheet «CMS Club»
Primera fila = cabeceras exactas (minúsculas, sin tildes). Hoy la pestaña Lecturas vive en `data/seed-lecturas.csv` con las mismas columnas.

**Lecturas**

| titulo | autor | estado | orden | fecha_sesion | isbn | google_books_id | portada_manual | descripcion_manual | nota_club | visible | revisar |
|---|---|---|---|---|---|---|---|---|---|---|---|
| texto | texto | leido / proximo / propuesta / por_clasificar | número | AAAA-MM-DD | opcional | opcional: fija la edición (de `books.google.com/books?id=…`) | URL opcional | texto opcional | texto opcional | si / no | nota interna opcional (la marca para revisar) |

`por_clasificar` y `visible = no` no se publican.

**Sesiones** — `fecha` | `hora` | `libros` (títulos separados por `;`) | `lugar` | `modalidad` | `plazas` | `notas_publicas` | `notas_miembros` | `visible`

**Textos** — `clave` | `valor` (markdown). Claves: `inicio_como_funciona`, `club_quienes_somos`, `club_normas`, `miembros_pago`, `miembros_cancelaciones`, `aviso_legal`, `privacidad`, `cookies`.

**Equipo** (solo admin puede cambiarla) — `email` | `nombre` | `rol` (admin / editora)

**Miembros** — `email` | `nombre` | `modalidad` (presencial / online) | `activo` (si / no) | `hash_contrasena` | `sal` | `cambio_pendiente` (si / no) | `intentos_fallidos` | `ultimo_acceso`. Apps Script escribe las columnas de contraseña; nadie más las edita.

**Peticiones** — `fecha` | `tipo` (propuesta, cambio de datos, pago, otra) | `de` (nombre o email) | `asunto` | `mensaje` | `estado` (nueva / en curso / resuelta) | `responsable` | `respuesta` | `actualizado`

**Propuestas** — `fecha` | `libro` | `autor` | `socio` | `nota` | `estado` (nueva / en votación / aceptada / descartada). Rellenada por el formulario de propuestas.

**Subidas** — ver Fase 2b.

**Valoraciones** — solo si se decide migrarlas (Fase 2a).

## Variables y propiedades

| Variable | Dónde | Estado |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `pages.yml` (variable de Actions `BASE_PATH`); vacío con dominio propio | en uso |
| `NEXT_PUBLIC_SITE_URL` | `pages.yml` (variable `SITE_URL`) | en uso |
| `NEXT_PUBLIC_SITE_MODE` | `pages.yml` (variable `SITE_MODE`): `private` / `public` | en uso |
| `APPS_SCRIPT_URL` | variable pública de Actions y `.env.example` (es una dirección, no un secreto) | Fase 0 |
| `GOOGLE_BOOKS_API_KEY` | **secreto** de Actions; en local, solo en la línea de comandos | en uso |
| `GH_DISPATCH_TOKEN` | **propiedad del script** de Apps Script (nunca en la web ni en el repo) | Fase 3 |
| `SHEET_ID`, `GH_REPO` | propiedades del script de Apps Script | Fase 0 |
| `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | secretos de Actions | Fase 5 |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | solo mientras existan las valoraciones en Supabase (Fase 2a) | en uso, retirar si se migran |

Nunca un secreto con prefijo `NEXT_PUBLIC_` (se incrusta en la web pública). Plantilla en `.env.example`.

## Riesgos conocidos
- **Ediciones dudosas en Google Books** (traducciones, títulos parecidos): puntuación con topes, marca `revisar` y `google_books_id` fijado a mano.
- **Google Books inestable**: los operadores `intitle:`/`inauthor:` a veces devuelven 0 resultados y hay 503 puntuales → intento final en texto libre, reintentos y fichas guardadas en el repo.
- **Condiciones de Google Books** (atribución, imágenes): se atribuye en cada ficha; las portadas se enlazan desde Google (`COVERS_MODE=remote`).
- **Valoraciones públicas**: posible spam → una por cuenta y libro; moderación manual hasta `/admin`.
- **Contraseñas de miembros con hash simple**: límite de intentos y reconsiderar Supabase Auth si el club crece (Fase 2).
- **Cuotas de Apps Script**: cientos de llamadas diarias sin problema para un club; si hay picos, la web pública sigue funcionando con la última copia publicada.
- **Instagram**: Meta cambia su API a menudo; caché y plan B (Behold).
- **Dependencia de una persona**: al menos dos cuentas con acceso de administración (Drive de la carpeta del club, Apps Script, GitHub). Inés es la propietaria de la Sheet; una segunda persona debe ser editora y tener acceso al script.
