# CLAUDE.md — Club del Último Miércoles

Contexto permanente para Claude Code. Léelo antes de cada tarea. El plan detallado está en `docs/PLAN.md` (diseño en `docs/DISENO.md`, recursos en `docs/ASSETS.md`, libros en `docs/GOOGLE-BOOKS.md`); trabaja fase a fase y marca las casillas al terminar.

## Qué es
Web del **Club del Último Miércoles**, club de lectura que se reúne cada dos meses (el último miércoles del mes, 19:30) en la Librería Celama (C/ Don Ramón de la Cruz, 93, Madrid). Dominio futuro: `www.clubultimomiercoles.es` (todavía sin comprar). Hasta entonces se publica en GitHub Pages: `https://vmarhuendatn.github.io/clubdelultimomiercoles/`.

## Principios
1. **La editora no programa.** Todo el contenido editable vive en una Google Sheet de Drive. La web lo sincroniza sola. Nunca obligues a tocar código para cambiar contenido.
2. **Privada hoy, pública mañana.** Un solo flag (`SITE_MODE=private|public`) decide si la web entera exige contraseña o solo el área de miembros.
3. **Fichas de libro automáticas.** Con título + autor basta: portada, sinopsis, ISBN, año y páginas se obtienen de Google Books, fuente única (ver `docs/GOOGLE-BOOKS.md`). Lo que Google no tenga se completa a mano en la Sheet; los campos manuales siempre ganan.
4. **Nunca escribir en los Google Docs existentes.** La cuenta de servicio solo tiene lectura sobre la Sheet CMS.
5. Español de España en toda la interfaz, URLs y mensajes de error.

## Stack (no cambiar sin preguntar)
- Next.js 15 (App Router, TypeScript estricto, Server Components por defecto) con **exportación estática** (`output: 'export'`): no hay servidor, ni middleware, ni rutas `/api`, ni optimizador de imágenes en tiempo de petición
- CSS propio, sin frameworks de utilidades: tokens en variables CSS + CSS Modules por componente (ver § Estructura). Nada de estilos en línea ni CSS dentro de los TSX.
- PWA instalable (manifest + iconos + service worker de caché ligera) para la experiencia "tipo app".
- Supabase: Postgres + Auth (email y contraseña) + Storage + RLS. Región UE.
- **GitHub Pages** (hosting, desplegado por GitHub Actions en cada push a `main`) y **GitHub Actions** para los procesos programados (sync de la Sheet, Instagram). Ver `docs/PLAN.md` § Despliegue
- Google Sheets API v4 con cuenta de servicio (solo lectura)
- Google Books API (única fuente de datos de libros; ver `docs/GOOGLE-BOOKS.md`)
- Instagram API con inicio de sesión de Instagram (cuenta profesional)
- Tests: Vitest (unitarios) y Playwright (flujos de login y acceso)
- Gestor de paquetes: pnpm

## Calidad exigida
- **Profesional y escalable**: arquitectura por funcionalidades, componentes pequeños y reutilizables, tipado estricto, sin duplicación.
- **Diseño tipo Apple / app**: sigue `docs/DISENO.md` al pie de la letra (espaciado, radios, desenfoques, barra inferior en móvil, títulos grandes, animaciones sobrias).
- **Accesible**: WCAG 2.2 AA obligatorio. Tests automáticos con axe en Playwright; ninguna página se fusiona con errores de axe.
- **Responsive**: móvil primero; probado a 360, 390, 768, 1024, 1280 y 1440 px.

## Identidad visual
Tipografías, todas con `next/font/google`:
- **Inter** (400, 500, 600, 700): cuerpo, interfaz, textos largos, títulos de libro en fichas.
- **Caveat** (500, 600, 700): titulares H1/H2, destacados, citas cortas. Es la más cercana al trazo manuscrito del logo y sigue siendo legible. **Nunca por debajo de 24 px** ni en párrafos.
- Alternativas si Caveat no convence: Kalam o Patrick Hand (mismo uso).

Paleta (sacada del logo del sillón):
| Token | Hex | Uso |
|---|---|---|
| `--papel` | `#FBF7EF` | fondo |
| `--tinta` | `#1C1A17` | texto |
| `--mostaza` | `#F2B84B` | color principal, botones |
| `--naranja` | `#E8892B` | hover, acentos |
| `--granate` | `#8E2B26` | enlaces, etiquetas |
| `--gris-calido` | `#6B645A` | texto secundario |

Contraste: texto sobre mostaza siempre en `--tinta`. Modo oscuro opcional en fase 7.
Logo original en `assets-src/brand/logo-trazo-original.png`; variantes web en `src/assets/images/brand/`. Favicons, iconos PWA y og-image se generan con `pnpm icons` (ver `docs/ASSETS.md`).

## Estructura (obligatoria)
Separación estricta: **estructura** (TSX = el "HTML"), **estilo** (`.css` / `.module.css`) y **lógica** (`.ts` en `lib/`, `hooks/`, `services/`). Un componente = una carpeta.

```
src/
├── app/                          # Solo rutas: páginas finas que componen features
│   ├── (publico)/                # inicio, lecturas, el-club, legales
│   ├── (auth)/                   # entrar, recuperar, restablecer
│   ├── (miembros)/miembros/
│   ├── (admin)/admin/
│   ├── api/                      # sync, instagram, revalidate
│   ├── layout.tsx
│   ├── manifest.ts
│   └── not-found.tsx
├── styles/                       # CSS global, en este orden de importación
│   ├── tokens.css                # colores, tipografía, espaciado, radios, sombras, z-index, motion
│   ├── reset.css
│   ├── base.css                  # html, body, tipografía base, foco visible
│   ├── layout.css                # contenedores, rejillas, safe-areas
│   ├── utilities.css             # pocas utilidades: visually-hidden, stack, cluster
│   └── index.css                 # importa todo lo anterior
├── components/
│   ├── ui/                       # átomos genéricos: Button, Icon, Input, Card, Sheet, Tabs, Skeleton, Toast
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.module.css
│   │       ├── Button.test.tsx
│   │       └── index.ts
│   └── layout/                   # Header, TabBar, Footer, PageHeader (large title)
├── features/                     # dominio, cada una autocontenida
│   ├── books/        (components/, services/, types.ts, utils.ts)
│   ├── sessions/
│   ├── instagram/
│   ├── auth/
│   ├── members/
│   └── admin/
├── lib/                          # clientes e infraestructura: supabase/, sheets/, books-api/, instagram-api/, env.ts
├── hooks/                        # hooks de cliente reutilizables
├── config/                       # site.ts (nav, textos fijos), routes.ts
└── types/                        # tipos globales y los generados de Supabase
src/assets/                       # Imágenes que se IMPORTAN en componentes (optimizadas por next/image)
├── images/
│   ├── brand/                    # logo en todas sus variantes
│   ├── illustrations/            # sillón, estados vacíos, errores
│   ├── photos/                   # fotos fijas: librería, encuentros
│   └── backgrounds/              # texturas de papel, fondos
├── icons/                        # SVG propios que no están en Lucide (como componentes)
└── fonts/                        # solo si alguna vez hace falta una fuente local
public/                           # Archivos servidos por URL fija (no se importan)
├── brand/
│   ├── favicon/                  # favicon.ico, favicon.svg, apple-touch-icon.png
│   ├── pwa/                      # icon-192.png, icon-512.png, icon-maskable-512.png
│   ├── og/                       # og-default.jpg (1200×630)
│   └── logo/                     # logo para emails y terceros (svg, png @1x @2x)
├── images/
│   └── placeholders/             # portada-placeholder.svg y similares
└── documents/                    # PDF públicos (p. ej. normas-del-club.pdf)
assets-src/                       # Originales editables (no se sirven): .ai, .psd, .fig, PNG a máxima resolución
├── brand/
├── illustrations/
└── photos/
```

Imágenes dinámicas (portadas, Instagram, fotos subidas desde Drive) **nunca** van al repo: viven en Supabase Storage. Normas completas de nombres, formatos, tamaños y buckets en `docs/ASSETS.md`.

Reglas:
- Ningún valor de color, tamaño, radio o sombra "a pelo" en un `.module.css`: siempre `var(--token)`.
- Nombres: componentes en PascalCase, archivos de lógica en kebab-case, clases CSS en camelCase dentro de los módulos.
- `app/` no contiene lógica de negocio; importa de `features/`.
- Cada feature exporta su API pública por `index.ts`; prohibido importar rutas internas de otra feature.

## Convenciones
- Todo acceso a datos privados pasa por RLS; la `service_role` solo se usa en los scripts que ejecuta GitHub Actions (sync, Instagram), nunca en el código del navegador. La protección real de datos es RLS: en una web estática el código cliente es público.
- Secretos solo en variables de entorno (ver `docs/PLAN.md` § Variables). Nunca en el repo.
- Commits en español, convencionales (`feat:`, `fix:`, `docs:`…). Una rama y un PR por fase.
- Antes de cada PR: `pnpm lint && pnpm typecheck && pnpm test`.
- Accesibilidad AA, móvil primero, imágenes con `next/image` y `alt` descriptivo.
- Mientras `SITE_MODE=private`: `robots: noindex` en todo el sitio, y **ningún dato privado se incrusta en el HTML del build** (se carga en el navegador tras el login, filtrado por RLS).
- El repositorio es **público**: nada privado en Git (ni emails, ni documentos internos, ni secretos).

## Datos y privacidad
- Normas del club: "lo que pasa en el Club, se queda en el Club". Nada de miembros, pagos ni comentarios de sesión en zonas públicas.
- Emails de miembros solo en Supabase y en la pestaña privada de la Sheet. Nunca en el front público.
- Cookies: solo las técnicas de sesión. Sin analítica con cookies (si se quiere, Plausible).
