# CLAUDE.md — Club del Último Miércoles

Contexto permanente para Claude Code. **Léelo antes de cada tarea.** Después, según la tarea:

| Documento | Para qué |
|---|---|
| `docs/PLAN.md` | Estado actual, fases y casillas. Trabaja fase a fase y marca las casillas al terminar. |
| `docs/DISENO.md` | Sistema de diseño (tokens, patrones, accesibilidad). Referencia viva en `/estilo/`. |
| `docs/ASSETS.md` | Imágenes y recursos: dónde va cada cosa, nombres, formatos, logo. |
| `docs/GOOGLE-BOOKS.md` | Fichas de libros: búsqueda, puntuación, portadas, sinopsis, caché. |
| `docs/GUIA-EDITORA.md` | Cómo se gestiona el contenido hoy (sin programar). Mantenerla al día. |
| `content/README.md` | Subidas públicas desde GitHub (documentos, fotos, portadas). |

## Qué es
Web del **Club del Último Miércoles**, club de lectura que se reúne cada dos meses (el último miércoles del mes, 19:30) en la Librería Celama (C/ Don Ramón de la Cruz, 93, Madrid).
- Publicada en GitHub Pages: `https://vmarhuendatn.github.io/clubdelultimomiercoles/` (repo **público** `vmarhuendaTN/clubdelultimomiercoles`).
- Dominio futuro: `www.clubultimomiercoles.es` (todavía sin comprar).

## Principios
1. **La editora no programa.** El contenido se edita sin tocar código: hoy, archivos de datos y carpetas en la web de GitHub (`data/`, `content/`); desde la Fase 3, una Google Sheet sincronizada sola. Nunca obligues a tocar código para cambiar contenido.
2. **Privada hoy, pública mañana.** Un solo flag (`SITE_MODE=private|public`) decide si la web exige sesión o solo el área de miembros. Hoy `private` = `noindex`; aún no hay login de miembros.
3. **Fichas de libro automáticas.** Con título + autor basta: portada, sinopsis, ISBN, año y páginas salen de Google Books, fuente única (ver `docs/GOOGLE-BOOKS.md`). Lo manual siempre gana (`google_books_id`, `portada_manual`, `descripcion_manual`, `content/portadas/`).
4. **Nunca escribir en los Google Docs existentes.** La cuenta de servicio solo tendrá lectura sobre la Sheet CMS.
5. Español de España en toda la interfaz, URLs, mensajes de error, commits y documentación.

## Stack (no cambiar sin preguntar)
- **Next.js 15** (App Router, TypeScript estricto, Server Components por defecto) con **exportación estática** (`output: 'export'`, `trailingSlash: true`, `basePath` configurable). No hay servidor: ni middleware, ni rutas `/api`, ni optimizador de imágenes (`images.unoptimized`).
- **CSS propio**: tokens en `src/styles/tokens.css` + CSS Modules por componente. Sin frameworks de utilidades, sin estilos en línea.
- **PWA** instalable: `app/manifest.ts`, iconos y `public/sw.js` (caché ligera).
- **Supabase** (proyecto `club-ultimo-miercoles`, id `voplbvbfuxgweyzarqzl`, París): Postgres + Auth + RLS (Storage, más adelante). Login con **Google** para valorar lecturas (cualquiera con cuenta de Google). Migraciones en `supabase/migrations/`.
- **GitHub Pages** desplegado por `.github/workflows/pages.yml` en cada push a `main`; **GitHub Actions** para CI (`ci.yml`) y, más adelante, procesos programados (sync de la Sheet, Instagram).
- **Google Books API** (única fuente de datos de libros). **Google Sheets API** con cuenta de servicio (Fase 3). **Instagram API** (Fase 5).
- Tests: **Vitest** (unitarios, jsdom) y **Playwright + axe** (e2e).
- Gestor de paquetes: **pnpm** 10, Node 22.

## Calidad exigida
- **Profesional y escalable**: arquitectura por funcionalidades, componentes pequeños y reutilizables, tipado estricto, sin duplicación.
- **Diseño tipo Apple / app**: sigue `docs/DISENO.md` (espaciado, radios, desenfoques, barra inferior en móvil, títulos grandes, animaciones sobrias).
- **Accesible**: WCAG 2.2 AA obligatorio. axe en Playwright en todas las páginas, en claro y oscuro; ninguna página se fusiona con errores de axe.
- **Responsive**: móvil primero; e2e a 360, 768 y 1440 px; revisar también 390, 1024 y 1280.

## Identidad visual
- **Inter** (400–700): cuerpo, interfaz, títulos de libro. **Caveat** (500–700): solo títulos de página, display y citas destacadas; **nunca por debajo de 24 px** ni en párrafos, botones o formularios. Ambas con `next/font/google`.
- Paleta (del logo del sillón): papel `#FBF7EF`, tinta `#1C1A17`, mostaza `#F2B84B`, naranja `#E8892B`, granate `#8E2B26`, gris cálido `#6B645A`. Texto sobre mostaza siempre en tinta. Valores exactos y modo oscuro (ya implementado) en `src/styles/tokens.css`.
- **Logo**: dibujo con textura de cera hecho por el club. Originales en `assets-src/brand/` (`logo-original-transparente.png`, `logo-original-sillon.png`, `logo-original-fondo-blanco.png`); variantes web y todos los iconos se generan con `pnpm icons` (ver `docs/ASSETS.md` § 8).

## Estructura (obligatoria)
Separación estricta: **estructura** (TSX), **estilo** (`.module.css`) y **lógica** (`.ts` en `lib/`, `hooks/`, `services/`). Un componente = una carpeta con `.tsx`, `.module.css`, `.test.tsx` e `index.ts`.

```
src/
├── app/                      # Solo rutas: páginas finas que componen features
│   ├── (publico)/            # lecturas, lecturas/[slug], galeria, el-club, documentos, privacidad
│   ├── (auth)/ (miembros)/ (admin)/   # vacías hasta las fases 2–4
│   ├── estilo/               # guía de estilo viva (noindex)
│   ├── page.tsx · layout.tsx · manifest.ts · not-found.tsx
├── styles/                   # tokens.css → reset → base → layout → utilities (index.css)
├── components/
│   ├── ui/                   # átomos: Button, Icon, Input, PasswordField, Card, Pill, SegmentedControl,
│   │                         #   SearchField, BottomSheet, Carousel, ExpandableText, Skeleton, Toast,
│   │                         #   StarRating, StarInput, TextArea, ThemedImage
│   ├── layout/               # SkipLink, Header, TabBar, NavLinks, PageHeader, Footer, ScrollToTop, Logo
│   └── pwa/                  # registro del service worker
├── features/                 # dominio; cada una exporta su API por index.ts (y server.ts si usa node:fs)
│   ├── books/                # lecturas: tarjetas, carrusel, explorador, ficha; services/build-lecturas.ts
│   ├── reviews/              # valoraciones (Supabase)
│   ├── auth/                 # entrar con Google, salir
│   ├── legal/                # política de privacidad (RGPD, LOPDGDD, LSSI)
│   ├── proposals/            # formulario de propuestas con código (enlace cifrado)
│   ├── gallery/ · instagram/ · documents/ · club/ · home/ · errors/ · style-guide/
│   └── sessions/ · members/ · admin/   # vacías hasta sus fases
├── lib/                      # infraestructura: books-api/, sheets/ (CSV + esquema Zod), supabase/,
│                             #   content/ (manifiesto de content/), dom/, format/, env.ts, fonts.ts
├── hooks/                    # use-session.ts
├── config/                   # site.ts (navegación, datos fijos), routes.ts
├── types/                    # supabase.ts (generado), assets.d.ts
├── assets/                   # imágenes importadas (brand/, illustrations/…) e icons/ propios
└── generated/                # (git-ignorado) lo generan los scripts antes de dev/build
data/                         # seed-lecturas.csv (lecturas hasta la Fase 3) · google-books.json (fichas)
content/                      # subidas públicas desde GitHub: documentos/, fotos/AAAA-MM-DD/, portadas/
public/                       # URL fija: brand/ (favicons, PWA, og, logo), sw.js, documents/
assets-src/                   # originales editables (no se sirven)
scripts/                      # build-content, build-books, cifrar-enlace, generate-icons, optimize-assets, serve-static
supabase/migrations/          # SQL aplicado en el proyecto de Supabase
e2e/                          # Playwright + axe (fixtures.ts intercepta Supabase)
```

Reglas:
- Ningún valor de color, tamaño, radio, sombra, z-index o duración "a pelo" en un `.module.css`: siempre `var(--token)` (Stylelint lo impide). Si falta un token, se añade a `tokens.css`.
- Media queries por **contenedor** (`@container pagina (…)` o contenedores propios); por viewport solo en `layout.css`.
- Nombres: componentes en PascalCase, lógica en kebab-case, clases CSS en camelCase.
- `app/` no contiene lógica de negocio; importa de `features/`.
- Cada feature exporta su API por `index.ts` (cliente) y, si usa `node:fs`, por `server.ts`. Prohibido importar rutas internas de otra feature (ESLint lo impide).
- Los scripts de `scripts/` no importan componentes (tsx no carga CSS): importan servicios puros.

## Datos y su flujo (hoy)
1. `pnpm content` → procesa `content/` (PDF, fotos sin EXIF/GPS a WebP, portadas propias) → `public/generated/` + `src/generated/contenido.json`.
2. `pnpm books` → lee `data/seed-lecturas.csv` (validado con Zod) + fichas de `data/google-books.json` (y consulta Google si hay `GOOGLE_BOOKS_API_KEY` y faltan) → `src/generated/lecturas.json`.
3. `next build` → HTML estático en `out/`. Ambos scripts se ejecutan solos en `predev` y `prebuild`.
4. En el navegador: valoraciones y sesión de Google contra Supabase (clave publicable + RLS).

## Cómo trabajar
- **Una rama por tarea o fase**, PR a `main`, fusionar solo con CI en verde. En Claude Code la rama de trabajo la indica la sesión.
- **Antes de cada commit**: `pnpm format:check && pnpm lint && pnpm lint:css && pnpm typecheck && pnpm test && pnpm assets:check`. Antes del PR, además `pnpm test:e2e`.
- **Commits** en español y convencionales (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- **Al terminar una tarea**: marcar casillas en `docs/PLAN.md` y actualizar el documento afectado (y `docs/GUIA-EDITORA.md` si cambia cómo se edita el contenido).
- **Cambios de base de datos**: nueva migración en `supabase/migrations/AAAAMMDDHHMMSS_nombre.sql`, aplicarla, revisar los avisos de seguridad de Supabase, regenerar `src/types/supabase.ts` y probar RLS como `anon` y `authenticated`.
- **Libros nuevos con datos de Google**: `GOOGLE_BOOKS_API_KEY=… pnpm books` y commit de `data/google-books.json`. La clave nunca va a un archivo.

## Entorno de Claude Code (sandbox)
- `next/font` descarga las fuentes con el proxy: compilar con `NODE_USE_ENV_PROXY=1` (ya funciona sin ello en GitHub Actions).
- Playwright: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium NODE_USE_ENV_PROXY=1 pnpm test:e2e`.
- Desde el sandbox **no** se llega a `books.google.com` (imágenes de portadas), `*.supabase.co` ni Git LFS. Para probar Supabase, usar las herramientas MCP (SQL con `set local role anon/authenticated` dentro de una transacción con `rollback`).
- `pkill -f <patrón>` puede matar el propio comando: buscar procesos con `ps -eo pid,args | grep "[p]atrón"`.

## Convenciones de seguridad y privacidad
- Todo acceso a datos pasa por **RLS**. En el navegador solo la clave publicable de Supabase; la `service_role` solo en scripts de GitHub Actions (secretos), nunca con prefijo `NEXT_PUBLIC_`.
- El repositorio es **público**: nada privado en Git (ni emails de miembros, ni documentos internos, ni claves). Lo de `content/` es público por definición.
- Mientras `SITE_MODE=private`: `robots: noindex` y **ningún dato privado en el HTML del build**.
- "Lo que pasa en el Club, se queda en el Club": nada de miembros, pagos ni comentarios de sesión en zonas públicas. Las **valoraciones** son públicas por decisión del club: se muestran con «Nombre I.» y el email nunca se publica.
- Cookies: solo técnicas (la sesión de Supabase vive en `localStorage`). Sin analítica con cookies.
