# Plan de desarrollo — web del Club del Último Miércoles

Objetivo: una web con login (usuario + contraseña por persona), catálogo automático de lecturas con portadas y sinopsis, últimas publicaciones de Instagram, y contenido editable desde Google Drive por una persona no técnica. Código en GitHub, publicada en GitHub Pages (web estática), preparada para abrirse al público en `www.clubultimomiercoles.es`.

Leyenda: **[H]** = tarea humana (cuentas, claves, pagos). **[CC]** = tarea para Claude Code.

---

## Arquitectura

```
 Google Drive                    GitHub Actions (cron y workflow_dispatch)
 ┌──────────────────────┐        ┌─────────────────────────────────────────────┐
 │ Sheet "CMS Club"     │◀───────┤ sync.yml (cada 30 min + "Publicar ahora")   │
 │  Lecturas            │ lectura│   ├─ Google Books → fichas y portadas       │
 │  Sesiones            │        │   └─ escribe en Supabase (service_role) ────┼──▶ Supabase
 │  Textos              │        │ instagram.yml (cada 6 h) ───────────────────┼──▶ (Postgres + Storage
 │  Miembros            │        │ pages.yml (push a main o tras un sync)      │     + Auth + RLS)
 └──────────────────────┘        │   └─ next build (export) → GitHub Pages     │        ▲
                                 └─────────────────────────────────────────────┘        │
                                                                                        │
 Navegador ── HTML/JS estático de GitHub Pages ── supabase-js (anon key + sesión) ──────┘
              (contenido público incrustado en el build;   datos de miembros/admin: en cliente, RLS)
```

Por qué así:
- **Sheet como CMS**: la editora ya trabaja en Drive; una hoja con columnas fijas es más robusta que leer documentos de texto libre. Los Google Docs actuales no se tocan: se importan una sola vez (ver `data/seed-lecturas.csv`).
- **Supabase** guarda la copia sincronizada: la web no depende de Google en cada visita y las portadas se sirven desde Storage (sin hotlinking).
- **Usuarios gestionados desde la Sheet**: añadir una fila en "Miembros" envía la invitación; marcar `activo = no` bloquea el acceso. Autosuficiente sin entrar en Supabase.

## Despliegue en GitHub Pages
- La web es una **exportación estática** de Next.js (`out/`), publicada por `.github/workflows/pages.yml`.
- Mientras no haya dominio, vive en `https://vmarhuendatn.github.io/clubdelultimomiercoles/` (`basePath` = `/clubdelultimomiercoles`).
- El contenido **público** (lecturas, fichas, textos) se lee de Supabase en el build y queda en el HTML: rápido y bueno para SEO. Tras cada sync con cambios se reconstruye la web (≈ 2–3 min).
- Lo **privado** (área de miembros, admin y, en modo privado, todo) nunca se incrusta: se pide a Supabase desde el navegador con la sesión del usuario y RLS decide qué devuelve.
- Sin previews por PR (Pages publica un único sitio): el CI valida cada PR con build, tests y axe.

---

## Fase 0 — Cuentas y claves [H]
Hacer en este orden y guardar cada clave en un gestor de contraseñas.

- [ ] **GitHub**: crear repo privado `club-ultimo-miercoles`. Subir `CLAUDE.md`, `docs/` (PLAN, DISENO, ASSETS, GOOGLE-BOOKS), `data/seed-lecturas.csv` y el logo original en `assets-src/brand/logo-trazo-original.png`. Reunir también en `assets-src/` las fotos e ilustraciones que el club quiera usar.
- [ ] **Supabase**: proyecto nuevo, región UE (Frankfurt o París). Anotar URL, `anon key`, `service_role key`.
- [ ] **GitHub Pages**: Settings → Pages → Build and deployment → Source: **GitHub Actions**. El workflow `pages.yml` publica en cada push a `main`. Guardar los secretos en Settings → Secrets and variables → Actions.
- [ ] **Google Cloud**: proyecto nuevo → activar *Google Sheets API* y *Books API* → crear **cuenta de servicio** y descargar su JSON → crear **API key** restringida a Books API.
- [ ] **Sheet CMS**: crear en Drive una hoja "CMS Club" con las pestañas del § Plantilla de la Sheet. Compartirla **solo como lector** con el email de la cuenta de servicio. Importar `data/seed-lecturas.csv` en la pestaña Lecturas.
- [ ] **Instagram**: pasar `@elultimomiercoles` a cuenta profesional (Creador o Empresa, gratis) → en developers.facebook.com crear app con el producto *Instagram API con inicio de sesión de Instagram* → generar token de larga duración (60 días; la web lo renueva sola).
- [ ] **Email transaccional** para invitaciones y recuperación de contraseña: Resend (gratis hasta 3.000/mes) conectado como SMTP en Supabase. Remitente provisional hasta tener dominio.

## Fase 1 — Esqueleto, arquitectura y sistema de diseño [CC]
Seguir `docs/DISENO.md` y la estructura de carpetas de `CLAUDE.md`.
- [x] Next.js 15 + TypeScript estricto + ESLint (con `eslint-plugin-jsx-a11y` y reglas de imports entre features) + Stylelint (prohíbe valores sin token) + Prettier + pnpm.
- [x] Crear la estructura completa de carpetas, aunque haya carpetas vacías con `README.md` de una línea.
- [x] Recursos según `docs/ASSETS.md`: árbol `src/assets/` y `public/`; scripts `pnpm assets` y `pnpm icons`; comprobación de recursos en CI.
- [ ] [H] Logo definitivo (lo prepara el club) en `src/assets/images/brand/` con los nombres de ASSETS § 2; después `pnpm icons`. Los SVG actuales son provisionales.
- [x] `src/styles/`: `tokens.css`, `reset.css`, `base.css`, `layout.css`, `utilities.css`, `index.css`, con modo claro y oscuro.
- [x] `next/font/google`: Inter y Caveat como variables CSS.
- [x] `components/ui`: Button, Icon (Lucide), Input, PasswordField, Card, SegmentedControl, BottomSheet (`<dialog>`), Skeleton, Toast, Badge/Pill. Cada uno en su carpeta con `.tsx`, `.module.css`, test e `index.ts`.
- [x] `components/layout`: SkipLink, Header translúcido (escritorio), TabBar (móvil), PageHeader con large title que se compacta, Footer.
- [x] `features/books/components`: BookCover (aspect-ratio 2:3, placeholder ilustrado), BookCard, BookCarousel (scroll-snap, teclado).
- [x] PWA: `app/manifest.ts`, iconos (incluido maskable y apple-touch-icon), `theme-color` claro y oscuro, service worker de caché de estáticos y portadas.
- [x] Favicon (ico + png) y og-image generados del logo (`pnpm icons`). `favicon.svg` pendiente del logo definitivo.
- [x] GitHub Actions `ci.yml`: lint, stylelint, typecheck, Vitest, Playwright + axe sobre `/estilo` (360, 768 y 1440 px; claro y oscuro). `pages.yml` publica en GitHub Pages.
- [x] Página `/estilo` (solo desarrollo) según § 7 de `DISENO.md`.

**Hecho cuando**: GitHub Pages muestra `/estilo` correcta a 360, 768 y 1440 px, en claro y oscuro, sin errores de axe, y navegable entera con teclado.

## Fase 2 — Base de datos y autenticación [CC]
Migraciones en `supabase/migrations`.

Tablas:
| Tabla | Campos clave |
|---|---|
| `profiles` | `id` (= auth.users), `nombre`, `rol` (`admin`/`editora`/`miembro`), `modalidad` (`presencial`/`online`), `activo` |
| `books` | `id`, `slug`, `titulo`, `titulo_google`, `subtitulo`, `autor`, `isbn`, `editorial`, `anio`, `paginas`, `descripcion`, `fuente_descripcion`, `categorias`, `idioma`, `enlace_google`, `portada_path`, `portada_lqip`, `color_dominante`, `google_books_id`, `puntuacion`, `revisar` (bool), `nota_revision`, `hash_origen`, `enriquecido_en` |
| `book_candidates` | `id`, `book_id`, `google_books_id`, `titulo`, `autores`, `editorial`, `anio`, `miniatura`, `puntuacion` |
| `sessions` | `id`, `fecha`, `hora` (def. 19:30), `lugar` (def. Librería Celama), `modalidad`, `plazas`, `notas_publicas`, `notas_miembros`, `visible` |
| `readings` | `id`, `book_id`, `session_id` (nullable), `estado` (`leido`/`proximo`/`propuesta`/`por_clasificar`), `orden`, `nota_club`, `visible` |
| `site_texts` | `clave`, `valor` (markdown) |
| `instagram_posts` | `id`, `permalink`, `media_type`, `media_path`, `caption`, `publicado_en` |
| `sync_runs` | `id`, `tipo`, `inicio`, `fin`, `estado`, `resumen` (jsonb) |

RLS:
- Público (cuando `SITE_MODE=public`): lectura de `books`, `readings` con `visible` y estado ≠ `por_clasificar`, `site_texts`, `instagram_posts`, campos públicos de `sessions`.
- `miembro`: además `sessions.notas_miembros`.
- `admin`/`editora`: lectura de `sync_runs` y `profiles`.
- Escritura: solo `service_role` (sync).

Auth:
- [ ] Email + contraseña con Supabase Auth. **Registro abierto desactivado**: solo por invitación.
- [ ] Rutas: `/entrar`, `/recuperar` (email de recuperación), `/restablecer` (nueva contraseña), `/salir`.
- [ ] Al aceptar la invitación, la persona fija su contraseña (`/restablecer`).
- [ ] Sin middleware (web estática): componente `RequireAuth` en los layouts de `(miembros)` y `(admin)` (y en todo el sitio si `SITE_MODE=private`) que redirige a `/entrar` sin sesión y comprueba el rol para `/admin`. Es solo experiencia de uso: **la seguridad la da RLS**; el HTML de esas rutas no contiene datos, se piden a Supabase tras el login.
- [ ] Bloqueo: usuarios con `activo=false` no pueden entrar (ban en Auth + RLS que exige `activo`).

**Hecho cuando**: tests de Playwright cubren entrar, salir, recuperar contraseña, acceso denegado sin sesión y acceso denegado a `/admin` con rol miembro.

## Fase 3 — Sincronización con Drive y fichas automáticas [CC]
Núcleo de la autonomía de la editora.

`src/lib/sheets`: lee las pestañas con la cuenta de servicio (scope `spreadsheets.readonly`). Valida cada fila con Zod; las filas con errores no rompen el sync, se reportan.

`src/lib/books-api` + `features/books/services/enrich-book.ts` — enriquecimiento con **Google Books como fuente única**, según `docs/GOOGLE-BOOKS.md`:
1. Orden de intentos: `google_books_id` fijado → `isbn:` → `intitle:"…"+inauthor:apellido` (`langRestrict=es`) → sin comillas → sin restricción de idioma. Siempre `country=ES` y respuesta parcial con `fields`.
2. Puntuación 0–100 de cada candidato (título, autor, idioma, portada, sinopsis, ISBN, páginas; penaliza resúmenes y guías). ≥ 70 se acepta; 50–69 se acepta con `revisar=true`; < 50 → sin datos, `revisar=true` y los 5 mejores van a `book_candidates`.
3. Siempre se termina con `GET /volumes/{id}` para obtener los tamaños grandes de portada.
4. Portada: mayor tamaño disponible, URL limpia, descarte del placeholder de Google, `sharp` → WebP 800 px + LQIP + color dominante. Destino según `COVERS_MODE` (`storage` o `remote`).
5. Sinopsis saneada con lista blanca de etiquetas; si no hay, la ficha no muestra la sección.
6. `portada_manual` y `descripcion_manual` de la Sheet siempre sustituyen a lo automático; la columna `revisar` de la Sheet (nota interna) fuerza `revisar=true` y se copia a `nota_revision`.
7. Solo se re-enriquece si cambia `hash_origen` (título+autor+isbn+google_books_id+manuales), con refresco nocturno de 10 libros de más de 180 días. Peticiones en serie, reintentos exponenciales y parada limpia ante `403` de cuota.

Endpoints:
- [ ] `scripts/sync.ts` ejecutado por `.github/workflows/sync.yml`: sincroniza Lecturas, Sesiones, Textos y Miembros; guarda `sync_runs`; si hubo cambios en contenido público, lanza `pages.yml` para reconstruir la web.
- [ ] `sync.yml` con `schedule` cada 30 minutos y `workflow_dispatch`.
- [ ] Botón **Publicar ahora** de `/admin`: llama a una Edge Function de Supabase (comprueba rol admin/editora) que dispara `workflow_dispatch` con un token de GitHub guardado como secreto de Supabase.
- [ ] Miembros: filas nuevas → `inviteUserByEmail`; `activo=no` → ban; cambio de rol → actualizar `profiles`. Nunca borrar usuarios automáticamente.
- [ ] `scripts/seed.ts`: carga inicial desde `data/seed-lecturas.csv` (solo para desarrollo local; en producción la fuente es la Sheet).

**Hecho cuando**: con la Sheet de prueba, las ~80 lecturas aparecen con portada y sinopsis, y el informe lista las que necesitan revisión.

## Fase 4 — Páginas [CC]
Públicas (o tras login mientras sea privada):
- [ ] `/` Inicio: claim, próxima sesión (fecha, libro, librería), últimas lecturas (carrusel de portadas), últimas 6 publicaciones de Instagram, bloque "Cómo funciona" (texto de la Sheet).
- [ ] `/lecturas`: rejilla de portadas, filtros por estado (leídos / próximo) y año, buscador por título o autor, orden cronológico inverso.
- [ ] `/lecturas/[slug]`: portada grande, título, autor, año, páginas, sinopsis, fecha de la sesión, nota del club, enlace a la Librería Celama.
- [ ] `/el-club`: quiénes somos, normas (desde `site_texts`), dónde y cuándo (mapa estático o enlace a Google Maps), cómo proponer lecturas (email `elultimomiercolesclub@gmail.com`).
- [ ] `/aviso-legal`, `/privacidad`, `/cookies` (textos editables en la Sheet; solo cookies técnicas).

Área de miembros:
- [ ] `/miembros`: próxima sesión con notas internas, recordatorio de pago y plazo de cancelación (texto de la Sheet), enlace al grupo de WhatsApp si se quiere.
- [ ] `/miembros/sesiones`: histórico de sesiones con fecha y libro.
- [ ] `/miembros/perfil`: cambiar nombre y contraseña.

Admin / editora:
- [ ] `/admin`: botón **Publicar ahora** (lanza sync), estado del último sync, lista de libros a revisar con enlace directo a la fila de la Sheet, lista de miembros (solo lectura), estado del token de Instagram.

- [ ] Patrones de `DISENO.md` § 4: TabBar, large title, control segmentado, carrusel tipo App Store, bottom sheets, transiciones de portada con View Transitions, estados vacíos, de error y de carga.
- [ ] Botón "Añadir al calendario" (`.ics`) en la próxima sesión.

**Hecho cuando**: Lighthouse ≥ 95 en accesibilidad y ≥ 90 en rendimiento en móvil para todas las rutas; axe sin errores; Core Web Vitals en verde; prueba manual con VoiceOver y con teclado.

## Fase 5 — Instagram [CC]
- [ ] `src/lib/instagram`: `GET /me/media` con campos `id,caption,media_type,media_url,thumbnail_url,permalink,timestamp`. Guardar las últimas 12 en `instagram_posts` y copiar la imagen a Storage (las URL de Instagram caducan).
- [ ] `.github/workflows/instagram.yml` cada 6 h: refresca publicaciones y **renueva el token** si le quedan menos de 15 días (`refresh_access_token`). Token guardado cifrado en una tabla `secrets` accesible solo por `service_role`, con valor inicial desde variable de entorno.
- [ ] Componente `InstagramGrid`: 6 cuadrados, carrusel/vídeo con su miniatura, enlace a la publicación y botón "Síguenos en Instagram".
- [ ] Si falla la API: mostrar las últimas guardadas y avisar en `/admin`.
- Plan B si no se quiere app de Meta: widget de Behold.so (gratis hasta cierto volumen) embebido en el mismo hueco.

## Fase 6 — Calidad, SEO y legal [CC]
- [ ] Metadatos por página, og-image por libro (portada sobre fondo papel).
- [ ] `sitemap.xml` y `robots.txt` condicionados a `SITE_MODE`.
- [ ] Datos estructurados `Book` en fichas y `Organization` en inicio.
- [ ] Páginas de error 404/500 con el sillón del logo.
- [ ] Auditoría de accesibilidad WCAG 2.2 AA completa (checklist de `DISENO.md` § 5) y declaración de accesibilidad en `/accesibilidad`.
- [ ] Tests visuales de regresión con capturas de Playwright a 390 y 1440 px.
- [ ] Prueba de instalación como app en iPhone (Safari → Añadir a pantalla de inicio) y Android.
- [ ] Copias: activar backups diarios de Supabase o exportación semanal por GitHub Action.

## Fase 7 — Dominio y apertura al público [H + CC]
- [ ] [H] Comprar `clubultimomiercoles.es` en un registrador acreditado por dominios .es (requiere titular con NIF/NIE).
- [ ] [H] Apuntar DNS a GitHub Pages (CNAME de `www` a `vmarhuendatn.github.io` y registros A del dominio raíz) y configurar el dominio en Settings → Pages; activar HTTPS. Variable de repositorio `BASE_PATH` vacía.
- [ ] [H] Verificar el dominio en Resend y cambiar remitente a `hola@clubultimomiercoles.es`.
- [ ] [CC] Actualizar `NEXT_PUBLIC_SITE_URL`, URLs de redirección de Supabase Auth y Meta.
- [ ] [CC] Cambiar `SITE_MODE=public`, quitar `noindex`, enviar sitemap a Google Search Console.

## Fase 8 — Ideas para después (no empezar sin confirmar)
- Valoraciones de miembros por libro (1–5) y media en la ficha (privada).
- Votación de propuestas dentro de la web, sustituyendo la del WhatsApp.
- Inscripción a sesiones con control de plazas.
- Calendario `.ics` suscribible con las próximas sesiones.
- Newsletter con la lectura de la siguiente sesión.

---

## Plantilla de la Sheet "CMS Club"
Primera fila = cabeceras exactas (minúsculas, sin tildes). Validación de datos en las columnas con valores cerrados.

**Lecturas**
| titulo | autor | estado | orden | fecha_sesion | isbn | google_books_id | portada_manual | descripcion_manual | nota_club | visible | revisar |
|---|---|---|---|---|---|---|---|---|---|---|---|
| texto | texto | leido / proximo / propuesta / por_clasificar | número | AAAA-MM-DD | opcional | opcional (fija la edición; se copia de `books.google.com/books?id=…` o de `/admin`) | URL opcional | texto opcional | texto opcional | si / no | nota interna opcional (dudas de título, autoría o edición); el sync la añade al informe y marca `revisar=true` |

**Sesiones**
| fecha | hora | libros (títulos separados por `;`) | lugar | modalidad | plazas | notas_publicas | notas_miembros | visible |

**Textos** — `clave` | `valor`. Claves previstas: `inicio_claim`, `inicio_como_funciona`, `club_quienes_somos`, `club_normas`, `miembros_pago`, `miembros_cancelaciones`, `aviso_legal`, `privacidad`, `cookies`. El valor admite markdown.

**Miembros** (pestaña que solo ve la organizadora) — `email` | `nombre` | `rol` (admin / editora / miembro) | `modalidad` | `activo` (si / no).

## Guía rápida para la editora (llevar luego a `/admin` como ayuda)
1. Añadir un libro: nueva fila en Lecturas con título y autor. Portada y sinopsis aparecen solas en ≤ 30 min (o al pulsar "Publicar ahora").
2. Edición o portada incorrecta: copiar el id correcto (desde `/admin` o la URL de Google Libros) en `google_books_id`, o pegar la URL de una buena portada en `portada_manual`.
3. Nueva sesión: fila en Sesiones; el libro debe existir en Lecturas con el mismo título.
4. Nueva persona: fila en Miembros → recibe un email para crear su contraseña.
5. Quitar acceso: `activo = no`.
6. Ocultar algo sin borrarlo: `visible = no`.

## Variables de entorno
| Variable | Dónde |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | variables de Actions (se incrustan en el build; son públicas) + `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | solo servidor |
| `GOOGLE_SERVICE_ACCOUNT_JSON` (base64) | solo servidor |
| `GOOGLE_SHEET_ID` | servidor |
| `GOOGLE_BOOKS_API_KEY` | servidor |
| `COVERS_MODE` | `storage` / `remote` (ver `docs/GOOGLE-BOOKS.md` § 9) |
| `INSTAGRAM_ACCESS_TOKEN` (inicial), `INSTAGRAM_USER_ID` | servidor |
| `NEXT_PUBLIC_BASE_PATH` | `/clubdelultimomiercoles` en GitHub Pages; vacío con dominio propio |
| `GH_DISPATCH_TOKEN` | secreto de Supabase (Edge Function de "Publicar ahora") |
| `NEXT_PUBLIC_SITE_MODE` | `private` / `public` (variable de Actions `SITE_MODE`) |
| `NEXT_PUBLIC_SITE_URL` | URL pública actual |

Los secretos de servidor (`SUPABASE_SERVICE_ROLE_KEY`, Google, Instagram) van en **Secrets de GitHub Actions**; nunca con prefijo `NEXT_PUBLIC_`. Crear `.env.example` con todas ellas vacías.

## Riesgos conocidos
- **Coincidencias de libros dudosas** (traducciones, ediciones): mitigado con puntuación, `revisar`, `book_candidates` y `google_books_id` fijado desde la Sheet.
- **Condiciones de Google Books** (atribución, almacenamiento de imágenes): revisar antes de la Fase 3; `COVERS_MODE` permite no copiar portadas.
- **Instagram**: Meta cambia su API con frecuencia; el diseño cachea y tiene plan B (Behold).
- **Cuota de Google Books** (1.000 consultas/día gratis): sobra con el hash de cambios.
- **Dependencia de una persona**: dos cuentas con rol `admin` como mínimo.
