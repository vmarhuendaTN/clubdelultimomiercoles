# Guía de imágenes y recursos

Qué va dónde, cómo se nombra y en qué formato. Claude Code debe aplicarla a cada recurso nuevo; `pnpm assets:check` (también en CI) rechaza lo que no cumple.

## 1. Los cinco lugares

| Lugar | Qué contiene | Cómo se usa | ¿En Git? |
|---|---|---|---|
| `assets-src/` | Originales editables a máxima calidad (PNG grandes, .psd, .fig…) | Nunca se sirven; de aquí salen las versiones web (`pnpm icons`) | Sí (sin LFS, para poder subirlos desde la web de GitHub; máx. 25 MB por archivo) |
| `src/assets/` | Imágenes que aparecen dentro de componentes | `import` + `next/image` | Sí |
| `public/` | Archivos con URL fija: favicons, iconos PWA, og-image, logo para emails | Ruta absoluta con `withBasePath()` | Sí |
| `content/` | Subidas **públicas** de la editora desde GitHub: documentos, fotos de sesiones, portadas propias | `pnpm content` las procesa a `public/generated/` en cada build | Sí (el repo es público) |
| Supabase Storage | Contenido privado o subido desde la web (Fases 2b, 3 y 5) | URL de Storage | **No** |

Regla rápida: si es parte del diseño → `src/assets/`; si un tercero necesita la URL → `public/`; si lo sube la editora y es público → `content/`; si es privado o se sube desde la web → Storage.

Portadas de Google Books: hoy se enlazan directamente desde Google (`COVERS_MODE=remote`, ver `docs/GOOGLE-BOOKS.md`); no se guardan en ningún sitio.

## 2. Árbol actual

```
assets-src/brand/
├── logo-original-transparente.png   # logo completo (sillón + texto), 2048 × 2048, transparente
├── logo-original-sillon.png         # solo el sillón (isotipo), transparente
└── logo-original-fondo-blanco.png   # versión con fondo blanco (referencia)

src/assets/
├── images/
│   ├── brand/
│   │   ├── logo-completo.webp         # sillón + texto (textura de cera)
│   │   ├── logo-completo-oscuro.webp  # texto aclarado para modo oscuro
│   │   └── logo-sillon.webp           # isotipo: cabecera, 404
│   ├── illustrations/ · photos/ · backgrounds/   # vacías por ahora
│   └── index.ts                       # exporta cada imagen con su alt: import { logoCompleto } from '@/assets/images'
├── icons/                             # SVG propios como componentes: IconInstagram, IconGoogle
└── fonts/                             # vacía: las fuentes van con next/font/google

public/
├── brand/
│   ├── favicon/   favicon.ico (16/32/48) · favicon-32.png · apple-touch-icon.png (180)
│   ├── pwa/       icon-192.png · icon-512.png · icon-maskable-512.png
│   ├── og/        og-default.jpg (1200 × 630, para WhatsApp y redes)
│   └── logo/      logo.png (800 px) · logo-email.png · logo-email@2x.png
├── documents/     # PDF fijos (vacía; los de la editora van a content/documentos/)
└── sw.js          # service worker

content/                               # ver content/README.md
├── documentos/    → /documentos/
├── fotos/AAAA-MM-DD/ → /galeria/
└── portadas/{slug}.jpg → sustituye la portada de Google
```

Las portadas sin imagen no usan archivos: `BookCover` dibuja una portada ilustrada con CSS (4 variantes de la paleta, estable por título).

## 3. Nombres
- Minúsculas, sin tildes ni eñes, palabras separadas por guiones: `estado-vacio-lecturas.svg`.
- Patrón `[tema]-[descripcion]-[variante].[ext]`: `logo-completo-oscuro.webp`.
- Densidad con `@2x` al final (`logo-email@2x.png`); series con dos cifras (`encuentro-ambiente-01.jpg`).
- Nunca nombres genéricos (`imagen1.png`, `final-final.jpg`).
- En `content/` la editora puede subir cualquier nombre: `pnpm content` los normaliza y avisa.

## 4. Formatos y pesos (los comprueba `pnpm assets:check`)

| Tipo | Formato | Tamaño máximo | Peso máximo |
|---|---|---|---|
| Logo (textura de cera) | WebP con transparencia | 2× lo mostrado (840 px) | 150 KB (`src/assets/images/brand/`) |
| Iconos e ilustraciones planas | SVG optimizado (SVGO), con `viewBox` y sin `width`/`height` | — | 15 KB |
| Ilustraciones con textura | WebP con transparencia | 2× lo mostrado | 120 KB |
| Fotos fijas | JPG calidad 82, sin EXIF | 2400 px lado largo | 400 KB |
| Texturas de fondo | WebP en mosaico | 512 × 512 | 40 KB |
| og-image | JPG | 1200 × 630 exacto | 200 KB |
| Iconos PWA y favicons | PNG / ICO | 192, 512, maskable 512 (zona segura 80 %) | — |
| Documentos de `content/` | PDF | — | 20 MB |
| Fotos y portadas de `content/` | JPG, PNG o WebP → WebP | 1600 px (fotos), 800 px de alto (portadas) | 25 MB de origen |

- Los SVG usan `currentColor` cuando deban cambiar con el tema.
- Sin metadatos EXIF (privacidad: nada de geolocalización en fotos de encuentros).

## 5. Supabase Storage (previsto)

| Bucket | Acceso | Ruta | Origen | Fase |
|---|---|---|---|---|
| `covers` | público | `covers/{slug}.webp` | sync de Google Books si `COVERS_MODE=storage` | 3 |
| `instagram` | público | `instagram/{post_id}.webp` | workflow de Instagram (las URL de Meta caducan) | 5 |
| `documents` | público | `documents/{archivo}` | subida desde `/admin/subir` | 2b |
| `private` | solo miembros (RLS) | `private/{tipo}/{archivo}` | subida desde `/admin/subir` | 2b |

## 6. Accesibilidad de imágenes
- Toda imagen informativa lleva `alt` en español; las decorativas, `alt=""` (y `aria-hidden` en SVG).
- Los `alt` de imágenes estáticas viven junto a su export en `src/assets/images/index.ts`.
- Nunca texto importante solo dentro de una imagen (por eso el nombre del club es también texto en la cabecera e inicio).

## 7. Automatización
- `pnpm icons` (`scripts/generate-icons.ts`): desde `logo-original-transparente.png` y `logo-original-sillon.png` genera las variantes WebP del logo (completo, oscuro, isotipo), favicons, iconos PWA, og-image y logos para emails.
- `pnpm assets` (`scripts/optimize-assets.ts`): optimiza (SVGO, JPG sin EXIF) y valida nombres, formatos y pesos. `pnpm assets:check` solo valida (CI).
- `pnpm content` (`scripts/build-content.ts`): procesa `content/` antes de cada `dev` y `build` (ver `content/README.md`).

## 8. Logo
El logo es un dibujo con textura de cera hecho por el club. No se vectoriza: perdería la textura.
- Para cambiarlo: sustituir los PNG de `assets-src/brand/` (mismos nombres) y ejecutar `pnpm icons`; revisar el resultado y hacer commit de lo generado.
- La versión oscura aclara el texto manuscrito dentro de la zona `TEXTO` de `scripts/generate-icons.ts` (fracciones del lienzo). Si cambia la composición del logo, ajustar esa zona.
- En la cabecera se usa el isotipo con el nombre en texto (el logo completo no se lee a 40 px); el logo completo, en inicio y en la og-image.
