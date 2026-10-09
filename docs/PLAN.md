# Plan de desarrollo — web del Club del Último Miércoles

Objetivo: una web con login (usuario + contraseña por persona), catálogo automático de lecturas con portadas y sinopsis, últimas publicaciones de Instagram, y contenido editable desde Google Drive por una persona no técnica. Código en GitHub, despliegue en Vercel, preparada para abrirse al público en `www.clubultimomiercoles.es`.

Leyenda: **[H]** = tarea humana (cuentas, claves, pagos). **[CC]** = tarea para Claude Code.

---

## Arquitectura

```
 Google Drive                         GitHub ──push──▶ Vercel (Next.js)
 ┌──────────────────────┐                               │
 │ Sheet "CMS Club"     │◀── lectura (cuenta servicio) ─┤ /api/sync  (cron 30 min + botón "Publicar ahora")
 │  Lecturas            │                               │    ├─ Google Books / Open Library → fichas y portadas
 │  Sesiones            │                               │    └─ Supabase (Postgres + Storage)
 │  Textos              │                               │
 │  Miembros            │                               │ /api/instagram/refresh (cron 6 h)
 └──────────────────────┘                               │    └─ Instagram API → tabla instagram_posts
                                                        │
                       Supabase Auth (email+contraseña) ◀┘ middleware: SITE_MODE private|public
```

Por qué así:
- **Sheet como CMS**: la editora ya trabaja en Drive; una hoja con columnas fijas es más robusta que leer documentos de texto libre. Los Google Docs actuales no se tocan: se importan una sola vez (ver `data/seed-lecturas.csv`).
- **Supabase** guarda la copia sincronizada: la web no depende de Google en cada visita y las portadas se sirven desde Storage (sin hotlinking).
- **Usuarios gestionados desde la Sheet**: añadir una fila en "Miembros" envía la invitación; marcar `activo = no` bloquea el acceso. Autosuficiente sin entrar en Supabase.

---

## Fase 0 — Cuentas y claves [H]
Hacer en este orden y guardar cada clave en un gestor de contraseñas.

- [ ] **GitHub**: crear repo privado `club-ultimo-miercoles`. Subir `CLAUDE.md`, `docs/` (PLAN, DISENO, ASSETS), `data/seed-lecturas.csv` y el logo original en `assets-src/brand/logo-trazo-original.png`. Reunir también en `assets-src/` las fotos e ilustraciones que el club quiera usar.
- [ ] **Supabase**: proyecto nuevo, región UE (Frankfurt o París). Anotar URL, `anon key`, `service_role key`.
- [ ] **Vercel**: importar el repo. Nota: el plan Hobby es para uso no comercial; si el club cobra cuotas por la web, valorar Pro o Netlify/Cloudflare Pages.
- [ ] **Google Cloud**: proyecto nuevo → activar *Google Sheets API* y *Books API* → crear **cuenta de servicio** y descargar su JSON → crear **API key** restringida a Books API.
- [ ] **Sheet CMS**: crear en Drive una hoja "CMS Club" con las pestañas del § Plantilla de la Sheet. Compartirla **solo como lector** con el email de la cuenta de servicio. Importar `data/seed-lecturas.csv` en la pestaña Lecturas.
- [ ] **Instagram**: pasar `@elultimomiercoles` a cuenta profesional (Creador o Empresa, gratis) → en developers.facebook.com crear app con el producto *Instagram API con inicio de sesión de Instagram* → generar token de larga duración (60 días; la web lo renueva sola).
- [ ] **Email transaccional** para invitaciones y recuperación de contraseña: Resend (gratis hasta 3.000/mes) conectado como SMTP en Supabase. Remitente provisional hasta tener dominio.

## Fase 1 — Esqueleto, arquitectura y sistema de diseño [CC]
Seguir `docs/DISENO.md` y la estructura de carpetas de `CLAUDE.md`.
- [ ] Next.js 15 + TypeScript estricto + ESLint (con `eslint-plugin-jsx-a11y` y reglas de imports entre features) + Stylelint (prohíbe valores sin token) + Prettier + pnpm.
- [ ] Crear la estructura completa de carpetas, aunque haya carpetas vacías con `README.md` de una línea.
- [ ] Recursos según `docs/ASSETS.md`: árbol `assets-src/` (con Git LFS), `src/assets/` y `public/`; vectorizar el logo y sacar sus variantes; scripts `pnpm assets` y `pnpm icons`; comprobación de recursos en CI.
- [ ] `src/styles/`: `tokens.css`, `reset.css`, `base.css`, `layout.css`, `utilities.css`, `index.css`, con modo claro y oscuro.
- [ ] `next/font/google`: Inter y Caveat como variables CSS.
- [ ] `components/ui`: Button, Icon (Lucide), Input, PasswordField, Card, SegmentedControl, BottomSheet (`<dialog>`), Skeleton, Toast, Badge/Pill. Cada uno en su carpeta con `.tsx`, `.module.css`, test e `index.ts`.
- [ ] `components/layout`: SkipLink, Header translúcido (escritorio), TabBar (móvil), PageHeader con large title que se compacta, Footer.
- [ ] `features/books/components`: BookCover (aspect-ratio 2:3, placeholder ilustrado), BookCard, BookCarousel (scroll-snap, teclado).
- [ ] PWA: `app/manifest.ts`, iconos (incluido maskable y apple-touch-icon), `theme-color` claro y oscuro, service worker de caché de estáticos y portadas.
- [ ] Favicon y og-image generados del logo.
- [ ] GitHub Actions `ci.yml`: lint, stylelint, typecheck, Vitest, Playwright + axe sobre `/estilo`.
- [ ] Página `/estilo` (solo desarrollo) según § 7 de `DISENO.md`.

**Hecho cuando**: preview de Vercel muestra `/estilo` correcta a 360, 768 y 1440 px, en claro y oscuro, sin errores de axe, y navegable entera con teclado.

## Fase 2 — Base de datos y autenticación [CC]
Migraciones en `supabase/migrations`.

Tablas:
| Tabla | Campos clave |
|---|---|
| `profiles` | `id` (= auth.users), `nombre`, `rol` (`admin`/`editora`/`miembro`), `modalidad` (`presencial`/`online`), `activo` |
| `books` | `id`, `slug`, `titulo`, `autor`, `isbn`, `editorial`, `anio`, `paginas`, `descripcion`, `portada_path`, `google_books_id`, `openlibrary_key`, `fuente_metadata`, `revisar` (bool), `hash_origen` |
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
- [ ] `middleware.ts`: si `SITE_MODE=private`, todo exige sesión salvo rutas de auth y estáticos; si `public`, solo `/miembros/**` y `/admin/**`. `/admin/**` exige rol `admin` o `editora`.
- [ ] Bloqueo: usuarios con `activo=false` no pueden entrar (ban en Auth + comprobación en middleware).

**Hecho cuando**: tests de Playwright cubren entrar, salir, recuperar contraseña, acceso denegado sin sesión y acceso denegado a `/admin` con rol miembro.

## Fase 3 — Sincronización con Drive y fichas automáticas [CC]
Núcleo de la autonomía de la editora.

`src/lib/sheets`: lee las pestañas con la cuenta de servicio (scope `spreadsheets.readonly`). Valida cada fila con Zod; las filas con errores no rompen el sync, se reportan.

`src/lib/books` — enriquecimiento:
1. Si la fila trae `isbn` → buscar por ISBN.
2. Si no → Google Books `intitle:` + `inauthor:` con `langRestrict=es`; elegir el resultado con mejor coincidencia normalizada (sin tildes, minúsculas) de título y autor.
3. Sin resultado o portada → Open Library (search + covers).
4. Descargar la portada a máxima resolución disponible a Supabase Storage (`covers/{slug}.jpg`), convertir a WebP.
5. `portada_manual` y `descripcion_manual` de la Sheet siempre sustituyen a lo automático.
6. Si la coincidencia es dudosa o no hay portada → `revisar=true` y aparece en el informe.
7. Solo se re-enriquece si cambia `hash_origen` (título+autor+isbn+manuales), para no gastar cuota.

Endpoints:
- [ ] `POST /api/sync` (protegido por `CRON_SECRET` o sesión admin/editora): sincroniza Lecturas, Sesiones, Textos y Miembros; guarda `sync_runs`; revalida páginas (`revalidatePath`).
- [ ] Cron de Vercel cada 30 minutos.
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
- [ ] Cron cada 6 h: refresca publicaciones y **renueva el token** si le quedan menos de 15 días (`refresh_access_token`). Token guardado cifrado en una tabla `secrets` accesible solo por `service_role`, con valor inicial desde variable de entorno.
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
- [ ] [H] Apuntar DNS a Vercel (A/CNAME que indique Vercel); redirección `clubultimomiercoles.es → www`.
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
| titulo | autor | estado | orden | fecha_sesion | isbn | portada_manual | descripcion_manual | nota_club | visible | revisar |
|---|---|---|---|---|---|---|---|---|---|---|
| texto | texto | leido / proximo / propuesta / por_clasificar | número | AAAA-MM-DD | opcional | URL opcional | texto opcional | texto opcional | si / no | nota interna opcional (dudas de título, autoría o edición); el sync la añade al informe y marca `revisar=true` |

**Sesiones**
| fecha | hora | libros (títulos separados por `;`) | lugar | modalidad | plazas | notas_publicas | notas_miembros | visible |

**Textos** — `clave` | `valor`. Claves previstas: `inicio_claim`, `inicio_como_funciona`, `club_quienes_somos`, `club_normas`, `miembros_pago`, `miembros_cancelaciones`, `aviso_legal`, `privacidad`, `cookies`. El valor admite markdown.

**Miembros** (pestaña que solo ve la organizadora) — `email` | `nombre` | `rol` (admin / editora / miembro) | `modalidad` | `activo` (si / no).

## Guía rápida para la editora (llevar luego a `/admin` como ayuda)
1. Añadir un libro: nueva fila en Lecturas con título y autor. Portada y sinopsis aparecen solas en ≤ 30 min (o al pulsar "Publicar ahora").
2. Portada incorrecta: pegar la URL de una buena en `portada_manual`.
3. Nueva sesión: fila en Sesiones; el libro debe existir en Lecturas con el mismo título.
4. Nueva persona: fila en Miembros → recibe un email para crear su contraseña.
5. Quitar acceso: `activo = no`.
6. Ocultar algo sin borrarlo: `visible = no`.

## Variables de entorno
| Variable | Dónde |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | solo servidor |
| `GOOGLE_SERVICE_ACCOUNT_JSON` (base64) | solo servidor |
| `GOOGLE_SHEET_ID` | servidor |
| `GOOGLE_BOOKS_API_KEY` | servidor |
| `INSTAGRAM_ACCESS_TOKEN` (inicial), `INSTAGRAM_USER_ID` | servidor |
| `CRON_SECRET` | servidor (Vercel Cron lo envía) |
| `SITE_MODE` | `private` / `public` |
| `NEXT_PUBLIC_SITE_URL` | URL pública actual |

Crear `.env.example` con todas ellas vacías.

## Riesgos conocidos
- **Coincidencias de libros dudosas** (traducciones, ediciones): mitigado con `revisar` + campos manuales.
- **Instagram**: Meta cambia su API con frecuencia; el diseño cachea y tiene plan B (Behold).
- **Cuota de Google Books** (1.000 consultas/día gratis): sobra con el hash de cambios.
- **Dependencia de una persona**: dos cuentas con rol `admin` como mínimo.
