# Guía de imágenes y recursos

Qué va dónde, cómo se nombra y en qué formato. Claude Code debe aplicarla a cada recurso nuevo y rechazar cualquiera que no la cumpla.

## 1. Los cuatro lugares

| Lugar | Qué contiene | Cómo se usa | ¿En Git? |
|---|---|---|---|
| `assets-src/` | Originales editables a máxima calidad (.ai, .psd, .fig, PNG/TIFF grandes) | Nunca se sirven; de aquí se exportan las versiones web | Sí, con **Git LFS** |
| `src/assets/` | Imágenes y SVG que aparecen dentro de componentes | `import` + `next/image` (optimización, blur y tamaños automáticos) | Sí |
| `public/` | Archivos que necesitan URL fija: favicons, iconos PWA, og-image, PDF, logo para emails | Ruta absoluta (`/brand/og/og-default.jpg`) | Sí |
| Supabase Storage | Contenido dinámico: portadas, Instagram, fotos de sesiones | URL de Storage + `next/image` con `remotePatterns` | **No** |

Regla rápida: si lo cambia la editora, va a Storage; si es parte del diseño, va a `src/assets/`; si un tercero necesita la URL, va a `public/`.

## 2. Árbol completo

```
assets-src/
├── brand/              logo-original.ai, logo-trazo-original.png
├── illustrations/      sillon-original.psd, estados-vacios.fig
└── photos/             libreria-celama-original-*.jpg

src/assets/
├── images/
│   ├── brand/
│   │   ├── logo-completo.svg          # sillón + texto
│   │   ├── logo-completo-oscuro.svg
│   │   ├── logo-sillon.svg            # solo sillón (isotipo)
│   │   └── logo-texto.svg             # solo "Club del último miércoles"
│   ├── illustrations/
│   │   ├── sillon-hero.webp
│   │   ├── estado-vacio-lecturas.svg
│   │   ├── estado-vacio-propuestas.svg
│   │   ├── error-404.svg
│   │   └── error-500.svg
│   ├── photos/
│   │   ├── libreria-celama-fachada.jpg
│   │   └── encuentro-ambiente-01.jpg
│   ├── backgrounds/
│   │   └── textura-papel.webp
│   └── index.ts                        # exporta todas con nombre: import { logoCompleto } from '@/assets/images'
├── icons/
│   ├── IconLibro.tsx                   # SVG propios como componentes
│   └── index.ts
└── fonts/                              # vacía salvo excepción

public/
├── brand/
│   ├── favicon/   favicon.ico · favicon.svg · apple-touch-icon.png (180×180)
│   ├── pwa/       icon-192.png · icon-512.png · icon-maskable-512.png · splash/*.png
│   ├── og/        og-default.jpg (1200×630) · og-lecturas.jpg
│   └── logo/      logo-email.png · logo-email@2x.png · logo.svg
├── images/
│   └── placeholders/  portada-placeholder.svg · avatar-placeholder.svg
└── documents/     normas-del-club.pdf
```

## 3. Nombres
- Minúsculas, sin tildes ni eñes, palabras separadas por guiones: `estado-vacio-lecturas.svg`.
- Patrón: `[tema]-[descripcion]-[variante].[ext]`, por ejemplo `logo-completo-oscuro.svg`.
- Variantes de densidad: `@2x` al final (`logo-email@2x.png`).
- Series: número con dos cifras (`encuentro-ambiente-01.jpg`).
- Nunca nombres genéricos (`imagen1.png`, `final-final.jpg`).

## 4. Formatos y tamaños

| Tipo | Formato | Tamaño máximo exportado | Peso objetivo |
|---|---|---|---|
| Logo, iconos, ilustraciones planas | SVG optimizado con SVGO | — | < 15 KB |
| Ilustraciones con textura (trazo del sillón) | WebP con transparencia | 2× el tamaño mostrado | < 120 KB |
| Fotos | JPG calidad 82 (Next sirve AVIF/WebP) | 2400 px lado largo | < 400 KB |
| Texturas de fondo | WebP en mosaico | 512 × 512 | < 40 KB |
| og-image | JPG | 1200 × 630 | < 200 KB |
| Iconos PWA | PNG | 192, 512, maskable 512 con zona segura del 80 % | — |
| Portadas (Storage) | WebP | 800 px de alto | < 120 KB |

- Los SVG usan `currentColor` cuando deban cambiar con el tema claro u oscuro.
- Cada SVG tiene `viewBox` y ningún `width`/`height` fijo.
- Metadatos EXIF eliminados (privacidad: nada de geolocalización en fotos de encuentros).

## 5. Supabase Storage (buckets)

| Bucket | Acceso | Ruta | Origen |
|---|---|---|---|
| `covers` | público | `covers/{slug}.webp` + `covers/{slug}-blur.txt` (LQIP) | sync de Google Books o `portada_manual` |
| `instagram` | público | `instagram/{post_id}.webp` | cron de Instagram (las URL de Meta caducan) |
| `sessions` | público | `sessions/{AAAA-MM-DD}/{nn}.webp` | carpeta de fotos en Drive (opcional, fase 8) |
| `private` | solo miembros (RLS) | `private/{tipo}/{archivo}` | documentos internos |

El sync convierte a WebP con `sharp`, redimensiona, genera el LQIP y guarda el color dominante de cada portada.

## 6. Accesibilidad de imágenes
- Toda imagen informativa lleva `alt` en español. Las decorativas, `alt=""` y `aria-hidden` en SVG.
- Los textos alternativos de las imágenes estáticas viven junto a su export en `src/assets/images/index.ts`, nunca improvisados en el componente.
- Nunca texto importante dentro de una imagen.

## 7. Automatización
- `scripts/optimize-assets.ts` (`pnpm assets`): SVGO sobre SVG, compresión de PNG/JPG/WebP, comprobación de nombres y tamaños según esta guía. Se ejecuta en CI y falla si algo no cumple.
- `scripts/generate-icons.ts` (`pnpm icons`): genera favicons, iconos PWA, splash screens y og-image a partir de `src/assets/images/brand/logo-sillon.svg`.
- `.gitattributes`: `assets-src/**` va por Git LFS.

## 8. Primer paso con el logo
El logo actual es un PNG con trazo a mano. Tareas:
1. [H] Guardar el PNG original en `assets-src/brand/logo-trazo-original.png` (y el archivo vectorial si existe).
2. [CC] Vectorizarlo con potrace o similar a `logo-completo.svg`, separar las variantes isotipo y texto, y hacer la versión oscura.
3. [H] Revisar visualmente que el trazo vectorizado conserva el carácter; si no, encargar o hacer la vectorización a mano y sustituir.
