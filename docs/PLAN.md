# Plan de desarrollo — web del Club del Último Miércoles

Objetivo: una web tipo app con catálogo automático de lecturas (portadas y sinopsis de Google Books), valoraciones, galería con Instagram, área de miembros y contenido editable sin programar. Código en GitHub (repo público), publicada en GitHub Pages como web estática, preparada para abrirse al público en `www.clubultimomiercoles.es`.

Leyenda: **[H]** = tarea humana (cuentas, claves, pagos). **[CC]** = tarea para Claude Code. Las casillas reflejan el estado real: márcalas al terminar.

---

## Estado actual (octubre 2026)

| Área | Estado |
|---|---|
| Web publicada | ✅ GitHub Pages, despliegue en cada push a `main` |
| Sistema de diseño, PWA, CI (lint, tipos, tests, axe) | ✅ Fase 1 completa |
| Logo definitivo y todos sus derivados | ✅ `pnpm icons` |
| Lecturas (`/lecturas`) y ficha de libro con datos de Google Books | ✅ 25 leídas + próxima (*Sinsonte*); 21 con portada real (fuente: `data/seed-lecturas.csv`) |
| Valoraciones con estrellas y opiniones (login con Google) | ✅ código y base de datos · ⏳ falta activar Google en Supabase [H] |
| Galería (Instagram en carrusel + fotos de sesiones) | ✅ página · ⏳ Instagram sin conectar (Fase 5) |
| Subidas públicas desde GitHub (`content/`) | ✅ documentos, fotos, portadas |
| El club, Documentos, Inicio | ✅ con textos provisionales; falta «Próxima sesión» |
| Sync con la Google Sheet | ⏳ Fase 3 (hoy las lecturas salen del CSV del repo) |
| Área de miembros, admin, subidas desde la web | ⏳ Fases 2, 2b y 4 |
| Legales, SEO, dominio | ⏳ Fases 6 y 7 |

**Siguiente paso recomendado**: terminar la Fase 0 (Google en Supabase, Sheet CMS) y empezar la Fase 3 (sync de la Sheet), que es lo que da autonomía a la editora.

---

## Arquitectura

```
 Google Drive                    GitHub Actions (cron y workflow_dispatch)
 ┌──────────────────────┐        ┌─────────────────────────────────────────────┐
 │ Sheet "CMS Club"     │◀───────┤ sync.yml (cada 30 min + "Publicar ahora")   │  ⏳ Fase 3
 │  Lecturas · Sesiones │ lectura│   ├─ Google Books → fichas y portadas       │
 │  Textos · Miembros   │        │   └─ escribe en Supabase (service_role) ────┼──▶ Supabase
 └──────────────────────┘        │ instagram.yml (cada 6 h)                    │  ⏳ Fase 5   (Postgres + Auth
                                 │ pages.yml (push a main) ✅                   │               + RLS + Storage)
 Repositorio (hoy) ─────────────▶│   ├─ pnpm content  (content/ → public/)     │                   ▲
  data/seed-lecturas.csv         │   ├─ pnpm books    (CSV + Google Books)     │                   │
  data/google-books.json         │   └─ next build (export) → GitHub Pages     │                   │
  content/                       └─────────────────────────────────────────────┘                   │
                                                                                                    │
 Navegador ── HTML/JS estático de GitHub Pages ── supabase-js (clave publicable + sesión Google) ───┘
              (contenido público incrustado en el build)   (valoraciones hoy; miembros/admin después, con RLS)
```

Por qué así:
- **Web estática en GitHub Pages**: gratis, rápida y sin servidor que mantener. Lo dinámico (valoraciones, sesión) va del navegador a Supabase con RLS.
- **Sheet como CMS** (Fase 3): la editora ya trabaja en Drive; una hoja con columnas fijas es más robusta que documentos de texto libre. Los Google Docs actuales no se tocan. Hasta entonces, la misma estructura vive en `data/seed-lecturas.csv`, editable desde la web de GitHub.
- **Fichas de Google Books guardadas en el repo** (`data/google-books.json`): la web no depende de Google en cada publicación y no gasta cuota.

## Despliegue en GitHub Pages
- Exportación estática de Next.js (`out/`) publicada por `.github/workflows/pages.yml` en cada push a `main` (o a mano: Actions → «Publicar en GitHub Pages» → Run workflow).
- Sin dominio, vive en `https://vmarhuendatn.github.io/clubdelultimomiercoles/` (`basePath` = `/clubdelultimomiercoles`).
- Lo **público** (lecturas, fichas, textos) se incrusta en el HTML en el build. Lo **privado** nunca: se pedirá a Supabase desde el navegador con la sesión y RLS.
- Sin previews por PR: el CI (`ci.yml`) valida cada PR con lint, tipos, tests unitarios, recursos y e2e con axe.

---

## Fase 0 — Cuentas y claves [H]
- [x] **GitHub**: repo público `vmarhuendaTN/clubdelultimomiercoles` con `CLAUDE.md`, `docs/`, `data/seed-lecturas.csv` y el logo en `assets-src/brand/`.
- [x] **GitHub Pages**: Source = GitHub Actions.
- [x] **Supabase**: proyecto `club-ultimo-miercoles` (eu-west-3, París). URL y clave publicable en `pages.yml` y `.env.example`.
- [x] **Google Books**: clave de API creada.
- [ ] **Google Books**: restringir la clave a «Books API» y guardarla como secreto `GOOGLE_BOOKS_API_KEY` del repo (Settings → Secrets and variables → Actions → *Secrets*).
- [ ] **Login con Google** (para valorar): pantalla de consentimiento OAuth (externa, publicada) + ID de cliente web con redirección `https://voplbvbfuxgweyzarqzl.supabase.co/auth/v1/callback`; en Supabase, activar el proveedor Google y en *URL Configuration* poner Site URL `https://vmarhuendatn.github.io/clubdelultimomiercoles/` y Redirect URLs `https://vmarhuendatn.github.io/clubdelultimomiercoles/**` y `http://localhost:3000/**`.
- [ ] **Google Cloud (Fase 3)**: activar *Google Sheets API*, crear **cuenta de servicio** y descargar su JSON (secreto `GOOGLE_SERVICE_ACCOUNT_JSON` en base64).
- [ ] **Sheet CMS**: hoja "CMS Club" con las pestañas del § Plantilla, compartida **solo como lector** con la cuenta de servicio; importar `data/seed-lecturas.csv` en Lecturas.
- [ ] **Instagram (Fase 5)**: `@elultimomiercoles` como cuenta profesional; app en developers.facebook.com con *Instagram API con inicio de sesión de Instagram*; token de larga duración.
- [ ] **Email transaccional** (solo si el área de miembros usa email): Resend como SMTP en Supabase.

## Fase 1 — Esqueleto, arquitectura y sistema de diseño [CC] ✅
- [x] Next.js 15 + TypeScript estricto + ESLint (jsx-a11y, imports entre features) + Stylelint (prohíbe valores sin token) + Prettier + pnpm.
- [x] Estructura de carpetas de `CLAUDE.md`.
- [x] Recursos según `docs/ASSETS.md`; scripts `pnpm assets` y `pnpm icons`; comprobación en CI.
- [x] Logo definitivo del club (textura de cera) y derivados: variantes WebP claro/oscuro/isotipo, favicons, iconos PWA, og-image, logos para emails.
- [x] `src/styles/` con tokens, reset, base, layout y utilidades; modo claro y oscuro.
- [x] Inter y Caveat con `next/font/google`.
- [x] `components/ui` y `components/layout` (ver catálogo en `docs/DISENO.md` § 4).
- [x] `features/books`: BookCover (2:3, portada ilustrada de respaldo), BookCard, BookCarousel.
- [x] PWA: manifest, iconos (maskable y apple-touch-icon), `theme-color` claro/oscuro, service worker.
- [x] GitHub Actions: `ci.yml` y `pages.yml`.
- [x] Página `/estilo` según `docs/DISENO.md` § 7.

## Fase 2 — Área de miembros y autenticación [CC]
> **Decidir antes de empezar [H]**: el login de miembros puede reutilizar **Google** (ya usado para valorar), permitiendo el área solo a los emails de la pestaña Miembros, o usar **email + contraseña por invitación** (plan original). Google evita contraseñas y emails transaccionales.

Tablas previstas (migraciones en `supabase/migrations/`):

| Tabla | Campos clave |
|---|---|
| `profiles` | `id` (= auth.users), `nombre`, `rol` (`admin`/`editora`/`miembro`), `modalidad` (`presencial`/`online`), `activo` |
| `books` | `id`, `slug`, `titulo`, `titulo_google`, `subtitulo`, `autor`, `isbn`, `editorial`, `anio`, `paginas`, `descripcion`, `citas`, `categorias`, `idioma`, `enlace_google`, `portada_url`, `google_books_id`, `puntuacion`, `revisar`, `nota_revision`, `hash_origen`, `enriquecido_en` |
| `book_candidates` | `id`, `book_id`, `google_books_id`, `titulo`, `autores`, `editorial`, `anio`, `miniatura`, `puntuacion` |
| `sessions` | `id`, `fecha`, `hora` (19:30), `lugar` (Librería Celama), `modalidad`, `plazas`, `notas_publicas`, `notas_miembros`, `visible` |
| `readings` | `id`, `book_id`, `session_id`, `estado` (`leido`/`proximo`/`propuesta`/`por_clasificar`), `orden`, `nota_club`, `visible` |
| `site_texts` | `clave`, `valor` (markdown) |
| `instagram_posts` | `id`, `permalink`, `media_type`, `media_path`, `caption`, `publicado_en` |
| `sync_runs` | `id`, `tipo`, `inicio`, `fin`, `estado`, `resumen` (jsonb) |

RLS: público (lecturas visibles y clasificadas, textos, Instagram, campos públicos de sesiones); `miembro` además notas de miembros; `admin`/`editora` además `sync_runs` y `profiles`; escritura de contenido solo `service_role` (sync).

- [ ] Rutas `(auth)`: `/entrar` (y, si se elige email, `/recuperar` y `/restablecer`), `/salir`.
- [ ] Sin middleware (web estática): componente `RequireAuth` en los layouts de `(miembros)` y `(admin)` (y en todo el sitio si `SITE_MODE=private`). Es solo experiencia de uso: **la seguridad la da RLS**.
- [ ] Bloqueo de `activo=false` (ban en Auth + RLS que exige `activo`).
- [ ] Pestaña «Perfil» o «Entrar» en la TabBar cuando exista el área.

**Hecho cuando**: Playwright cubre entrar, salir, acceso denegado sin sesión y acceso denegado a `/admin` con rol miembro.

## Fase 2a — Valoraciones de lecturas [CC] ✅
Cualquiera con cuenta de Google puede poner de 1 a 5 estrellas y una opinión a cada lectura; las opiniones son públicas.
- [x] Migración `supabase/migrations/20261009120000_valoraciones.sql`: tabla `valoraciones` (una por persona y libro) y vista `valoraciones_resumen`. RLS: lectura pública; escritura solo de la propia; los anónimos no ven `user_id`.
- [x] Autor y nombre público («Nombre I.», inicial del primer apellido) fijados por trigger desde la cuenta de Google; el email nunca se publica.
- [x] `features/reviews`: sección «Valoraciones» en la ficha (media, opiniones, estrellas accesibles, editar/borrar) y media en las tarjetas de `/lecturas`. `features/auth`: entrar con Google (PKCE) y salir.
- [ ] [H] Activar Google en Supabase (ver Fase 0).
- [ ] Moderación desde `/admin` (hoy: Supabase → Table Editor → `valoraciones`).
- [x] Explicar las valoraciones en `/privacidad` (nombre visible, email no, borrado a petición) y enlazarla desde el aviso de acceso.

## Fase 2b — Subida de archivos [CC]
**Desde GitHub ✅** — carpeta `content/` (ver `content/README.md`), todo **público**. `scripts/build-content.ts` lo procesa en cada build (nombres normalizados, fotos a WebP sin EXIF/GPS, portadas con LQIP). Se ve en `/documentos/`, `/galeria/` y en las portadas.

**Desde la web** — `/admin/subir`, solo `admin`/`editora`:
- [ ] Tabla `uploads` (`tipo`, `titulo`, `visibilidad` `publico`/`miembros`, `bucket`, `ruta`, `sesion_fecha`, `book_slug`, `bytes`, `subido_por`, `creado_en`).
- [ ] Buckets `documents` (público) y `private` (solo miembros, RLS en `storage.objects`).
- [ ] Formulario con arrastrar y soltar y selector **Público / Solo miembros**; fotos reducidas y sin EXIF **en el navegador** antes de subir.
- [ ] Lo público entra en el siguiente build («Publicar ahora»); lo de miembros, en `/miembros/documentos` con URL firmada.
- [ ] Gestión: listar, renombrar, cambiar visibilidad y borrar.

## Fase 3 — Sincronización con la Sheet y fichas automáticas [CC]
Núcleo de la autonomía de la editora.

Ya hecho (adelantado para ver las lecturas):
- [x] `src/lib/books-api` según `docs/GOOGLE-BOOKS.md`: intentos de búsqueda (con texto libre de último recurso), puntuación con topes, ficha completa por id, portada y sinopsis de respaldo de otra edición fiable, separación de citas de prensa, reintentos y cuota. Con tests.
- [x] `src/lib/sheets`: lector de CSV y esquema Zod de la pestaña Lecturas (las filas con errores se informan, no rompen nada).
- [x] `scripts/build-books.ts`: lecturas desde `data/seed-lecturas.csv`, fichas guardadas en `data/google-books.json` por `hash_origen`, reintento a las 24 h de los libros sin resultado, informe de libros a revisar.

Pendiente:
- [ ] `src/lib/sheets`: lectura de la Sheet con la cuenta de servicio (`spreadsheets.readonly`) para Lecturas, Sesiones, Textos y Miembros.
- [ ] `scripts/sync.ts` + `.github/workflows/sync.yml` (cada 30 min y `workflow_dispatch`): sincroniza, guarda `sync_runs` y, si cambió algo público, lanza `pages.yml`.
- [ ] Guardar en Supabase `books`, `book_candidates` y `readings` (o seguir con archivos en el build: decidir al empezar).
- [ ] Portadas en Supabase Storage (`COVERS_MODE=storage`) con descarte del placeholder de Google, o mantener `remote` (hoy).
- [ ] Botón **Publicar ahora** de `/admin`: Edge Function (rol admin/editora) que dispara `workflow_dispatch`.
- [ ] Miembros desde la Sheet: alta, bloqueo (`activo=no`) y cambio de rol. Nunca borrar usuarios automáticamente.

**Hecho cuando**: con la Sheet real, las ~80 lecturas se publican con portada y sinopsis y el informe lista las que necesitan revisión.

## Fase 4 — Páginas [CC]
Públicas (o tras login mientras sea privada):
- [ ] `/` Inicio: logo y «Lo último que hemos leído» **hechos** (sin claim, por decisión del club); falta la tarjeta «Próxima sesión» (fecha, libro, lugar, «Añadir al calendario» `.ics`) y «Cómo funciona».
- [x] `/lecturas`: control segmentado (próximo / leídos / propuestas; se abre en Próximo), próxima lectura destacada, rejilla y buscador en Leídos, agrupación por año (cuando haya `fecha_sesion`), media de valoraciones; maqueta revisada en escritorio.
- [x] Propuestas: formulario de Google «Propón la próxima lectura» protegido con el código del club (enlace cifrado; `pnpm cifrar-enlace` para cambiarlo).
- [x] `/lecturas/[slug]`: portada sobre su color, edición, sinopsis con «Leer más», «Lo que dice la crítica», ficha técnica, nota del club, valoraciones, enlaces a Google Libros y a la librería, atribución.
- [x] `/galeria` (pestaña): Instagram (perfil incrustado, se carga al pedirlo; carrusel con la API en la Fase 5) y fotos de sesiones.
- [x] `/el-club` (textos provisionales hasta la pestaña Textos), Substack, «Quiero ser del club» (email preparado) y `/documentos`.
- [x] `/privacidad`: política según RGPD, LOPDGDD y LSSI (responsable, finalidades y bases, plazos, encargados y transferencias, derechos y AEPD, menores, cookies). Única página legal del pie, por decisión del club (sin aviso legal, cookies ni accesibilidad: no hay cookies y las cuestiones se resuelven en privacidad).
- [x] Pie compacto: nombre, «Escríbenos», Instagram y Privacidad (sin dirección).

Área de miembros:
- [ ] `/miembros`: próxima sesión con notas internas, recordatorio de pago y cancelaciones, grupo de WhatsApp.
- [ ] `/miembros/sesiones`: histórico. `/miembros/perfil`: datos propios.

Admin / editora:
- [ ] `/admin`: Publicar ahora, estado del último sync, libros a revisar con sus candidatos, miembros (solo lectura), moderación de valoraciones, estado del token de Instagram.

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
- [ ] Auditoría WCAG 2.2 AA completa.
- [ ] Tests visuales de regresión (capturas a 390 y 1440 px).
- [ ] Prueba de instalación como app en iPhone y Android.
- [ ] Copias de seguridad de Supabase.

## Fase 7 — Dominio y apertura al público [H + CC]
- [ ] [H] Comprar `clubultimomiercoles.es` (titular con NIF/NIE).
- [ ] [H] DNS a GitHub Pages (CNAME de `www` a `vmarhuendatn.github.io` y registros A del raíz), dominio en Settings → Pages, HTTPS.
- [ ] [CC] `BASE_PATH` vacío y `SITE_URL` nuevo (variables de Actions), URLs de redirección de Supabase y Google OAuth.
- [ ] [CC] `SITE_MODE=public`, quitar `noindex`, sitemap en Search Console.

## Fase 8 — Ideas para después (no empezar sin confirmar)
- Votación de propuestas en la web (sustituyendo la del WhatsApp).
- Inscripción a sesiones con plazas.
- Calendario `.ics` suscribible.
- Newsletter con la próxima lectura.

---

## Plantilla de la Sheet "CMS Club"
Primera fila = cabeceras exactas (minúsculas, sin tildes). Hoy la pestaña Lecturas vive en `data/seed-lecturas.csv` con las mismas columnas.

**Lecturas**

| titulo | autor | estado | orden | fecha_sesion | isbn | google_books_id | portada_manual | descripcion_manual | nota_club | visible | revisar |
|---|---|---|---|---|---|---|---|---|---|---|---|
| texto | texto | leido / proximo / propuesta / por_clasificar | número | AAAA-MM-DD | opcional | opcional: fija la edición (de `books.google.com/books?id=…`) | URL opcional | texto opcional | texto opcional | si / no | nota interna opcional (la marca para revisar) |

`por_clasificar` y `visible = no` no se publican.

**Sesiones** — `fecha` | `hora` | `libros` (títulos separados por `;`) | `lugar` | `modalidad` | `plazas` | `notas_publicas` | `notas_miembros` | `visible`

**Textos** — `clave` | `valor` (markdown). Claves: `inicio_como_funciona`, `club_quienes_somos`, `club_normas`, `miembros_pago`, `miembros_cancelaciones`, `aviso_legal`, `privacidad`, `cookies`.

**Miembros** (solo la organizadora) — `email` | `nombre` | `rol` (admin / editora / miembro) | `modalidad` | `activo` (si / no).

## Variables de entorno

| Variable | Dónde | Estado |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `pages.yml` (variable de Actions `BASE_PATH`); vacío con dominio propio | en uso |
| `NEXT_PUBLIC_SITE_URL` | `pages.yml` (variable `SITE_URL`) | en uso |
| `NEXT_PUBLIC_SITE_MODE` | `pages.yml` (variable `SITE_MODE`): `private` / `public` | en uso |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | públicas; valores por defecto en `pages.yml` y `.env.example` | en uso |
| `GOOGLE_BOOKS_API_KEY` | **secreto** de Actions; en local, solo en la línea de comandos | en uso |
| `SUPABASE_SERVICE_ROLE_KEY` | secreto de Actions (scripts de sync) | Fase 3 |
| `GOOGLE_SERVICE_ACCOUNT_JSON` (base64), `GOOGLE_SHEET_ID` | secretos de Actions | Fase 3 |
| `COVERS_MODE` | `remote` (hoy) / `storage` | Fase 3 |
| `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | secretos de Actions | Fase 5 |
| `GH_DISPATCH_TOKEN` | secreto de Supabase (Edge Function «Publicar ahora») | Fase 3–4 |

Nunca un secreto con prefijo `NEXT_PUBLIC_` (se incrusta en la web pública). Plantilla en `.env.example`.

## Riesgos conocidos
- **Ediciones dudosas en Google Books** (traducciones, títulos parecidos): puntuación con topes, marca `revisar` y `google_books_id` fijado a mano.
- **Google Books inestable**: los operadores `intitle:`/`inauthor:` a veces devuelven 0 resultados y hay 503 puntuales → intento final en texto libre, reintentos y fichas guardadas en el repo.
- **Condiciones de Google Books** (atribución, imágenes): se atribuye en cada ficha; las portadas se enlazan desde Google (`COVERS_MODE=remote`).
- **Valoraciones públicas**: posible spam → una por cuenta y libro; moderación manual hasta `/admin`.
- **Instagram**: Meta cambia su API a menudo; caché y plan B (Behold).
- **Dependencia de una persona**: al menos dos cuentas con acceso de administración (GitHub, Supabase, Google Cloud).
