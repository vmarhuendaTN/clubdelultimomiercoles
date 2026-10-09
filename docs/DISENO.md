# Sistema de diseño — Club del Último Miércoles

Referencia: las Human Interface Guidelines de Apple y apps como Libros, Música o App Store, filtradas por la calidez del logo (sillón mostaza, trazo de cera). Resultado buscado: limpio, aireado, táctil, con contenido protagonista (las portadas) y un guiño manuscrito en los titulares.

**Fuente de verdad**: los valores viven en `src/styles/tokens.css`; este documento explica su intención. La referencia visual viva es la página `/estilo/`. Si cambias un token, cambia aquí su descripción.

## 1. Principios
1. **El contenido manda**: portadas grandes, interfaz discreta, mucho espacio en blanco.
2. **Claridad**: una acción principal por pantalla, jerarquía tipográfica evidente.
3. **Profundidad sutil**: capas translúcidas con desenfoque, sombras suaves y transiciones que explican de dónde viene cada cosa.
4. **Sensación de app**: navegación inferior fija en móvil, títulos grandes que se compactan al hacer scroll, hojas modales que suben desde abajo, PWA instalable.

## 2. Tokens (`src/styles/tokens.css`)
Regla: en los `.module.css` nunca hay valores literales de color, tamaño, radio, sombra, z-index ni duración; siempre `var(--token)`. Stylelint lo comprueba. Si hace falta un valor nuevo, se crea un token.

### Color
| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-mostaza` | `#F2B84B` | igual | botón principal, acentos |
| `--color-mostaza-fuerte` | `#E0A332` | igual | hover del botón principal |
| `--color-naranja` | `#E8892B` | igual | acentos, portadas ilustradas |
| `--color-granate` | `#8E2B26` | `#E07A72` | enlaces, pestaña activa, etiquetas |
| `--color-fondo` | `#FBF7EF` (papel) | `#141210` | fondo de página |
| `--color-superficie` / `-2` | `#FFFFFF` / `#F4EEE3` | `#1E1B18` / `#2A2622` | tarjetas / controles y pie |
| `--color-material` | papel al 72 % | fondo al 72 % | barras translúcidas (cabecera, barra compacta) |
| `--color-material-barra` | papel al 94 % | fondo al 94 % | TabBar (texto pequeño encima: garantiza AA) |
| `--color-texto` / `-2` / `-3` | `#1C1A17` / `#6B645A` / `#6F685E` | `#F5EFE4` / `#B9B0A2` / `#A39A8D` | texto principal / secundario / terciario |
| `--color-sobre-mostaza` | `#1C1A17` | igual | texto sobre mostaza (siempre tinta) |
| `--color-foco` | `#8E2B26` | `#F2B84B` | anillo de foco |
| `--color-exito` / `--color-error` | `#2F7D4F` / `#B3261E` | `#6FCF97` / `#F2948C` | estados |
| `--color-estrella` / `-vacia` | `#B06F10` / `#C9BFAE` | `#F2B84B` / `#5A524A` | valoraciones (3:1 sobre el fondo) |
| `--color-tinta`, `--color-crema`, `--color-granate-portada(-2)`, `--color-papel-portada(-2)` | fijos | fijos | portadas ilustradas (son objetos: no cambian con el tema) |

Todas las combinaciones texto/fondo pasan AA (4,5:1 texto normal; 3:1 texto ≥ 24 px y componentes). `--color-texto-3` se oscureció respecto al diseño original (`#9A9286` no llegaba a AA).

### Tipografía
Escala inspirada en la de iOS, fluida con `clamp()`, en `rem`:

| Token | Fuente | Tamaño (móvil → escritorio) | Peso | Uso |
|---|---|---|---|---|
| `--text-display` | Caveat | 44 → 72 px | 700 | titulares muy destacados |
| `--text-large-title` | Caveat | 36 → 52 px | 700 | título de página (`PageHeader`) |
| `--text-title-1` | Inter | 26 → 32 px | 700 | secciones, título de la ficha de libro |
| `--text-title-2` | Inter | 21 → 24 px | 600 | subsecciones, tarjetas |
| `--text-headline` | Inter | 17 px | 600 | títulos de libro en tarjetas |
| `--text-body` | Inter | 17 px | 400 | texto |
| `--text-callout` | Inter | 16 px | 400 | botones, textos secundarios |
| `--text-subhead` | Inter | 15 px | 400 | autor, metadatos |
| `--text-footnote` | Inter | 13 px | 400 | notas, fechas |
| `--text-caption` | Inter | 12 px | 500 | etiquetas |
| `--text-barra` | Inter | 11 px | 500 | etiquetas de la TabBar |

- Interlineado 1,5 en cuerpo y 1,15 en títulos; tracking `-0.02em` en Inter ≥ 26 px.
- Caveat solo en `display`, `large-title`, citas destacadas y nota del club. Nunca en botones, menús, formularios ni por debajo de 24 px (en portadas ilustradas pequeñas cambia a Inter).

### Espaciado, tamaños y radios
- Espaciado (rejilla 4/8 pt): `--space-0-5` (2 px) a `--space-24` (96 px).
- Márgenes de página: 20 px en móvil, 32 px desde 768 px; contenido centrado con `--ancho-max: 1200px`; texto largo a `--ancho-texto: 68ch`.
- Tamaños con nombre: `--size-tactil` (44 px), `--size-campo` (52 px), `--size-tabbar`, `--size-header`, portadas (`--size-portada-sm/md/lg/xl`), `--size-lateral` (ficha técnica) y otros. Úsalos en vez de números.
- Radios: `--radius-xs` 6 px (portadas: son objetos físicos), `sm` 8 (etiquetas), `md` 12 (campos, botones), `lg` 20 (tarjetas), `xl` 28 (hojas modales), `full` (pills).

### Sombras, materiales, movimiento y capas
- Sombras `--shadow-1/2/3` y `--shadow-portada` (sombra de objeto). Material translúcido `--blur-material` con respaldo opaco `@supports not (backdrop-filter: …)`.
- Movimiento: `--ease-standard`, `--ease-spring`, `--duration-fast/base/slow`. Pulsación `scale(var(--scale-pulsado))` (0,97). Con `prefers-reduced-motion` no hay escalas ni desplazamientos, solo fundidos.
- Capas: `--z-base`, `--z-sticky`, `--z-tabbar`, `--z-overlay`, `--z-sheet`, `--z-toast`, `--z-skip`.

## 3. Responsive
| Breakpoint | Ancho | Navegación | Rejilla de portadas |
|---|---|---|---|
| móvil | < 768 px | TabBar inferior + título grande que se compacta | 2 columnas |
| tableta | 768–1023 px | TabBar inferior | 3–4 columnas |
| escritorio | ≥ 1024 px | barra superior translúcida | 5–6 columnas |

- El `body` es un contenedor (`container: pagina / inline-size`): los componentes usan `@container pagina (width >= …)` o contenedores propios. Media queries por viewport solo en `layout.css`.
- `env(safe-area-inset-*)` en TabBar, cabecera y hojas modales.
- Áreas táctiles ≥ 44 × 44 px; sin scroll horizontal a 320 px.
- Portadas con `aspect-ratio: 2 / 3` y `sizes` correctos (CLS = 0).

## 4. Componentes y patrones

### Catálogo
| Componente | Ruta | Notas |
|---|---|---|
| Button | `components/ui/Button` | `primario` (mostaza), `secundario`, `sencillo`; tamaños `md`/`sm`; con `href` es un enlace |
| Icon | `components/ui/Icon` | Lucide a 1,75 px; marcas propias (Instagram, Google) en `src/assets/icons` |
| Input, PasswordField, SearchField | `components/ui/…` | etiqueta siempre accesible, errores con `aria-live` |
| Card, Pill | `components/ui/…` | tarjetas de radio 20; pills para estados y metadatos |
| SegmentedControl | `components/ui/SegmentedControl` | patrón de pestañas ARIA (flechas, Inicio, Fin) |
| Carousel | `components/ui/Carousel` | scroll-snap tipo App Store; formatos `portada` y `cuadrado` |
| BottomSheet | `components/ui/BottomSheet` | `<dialog>` nativo: hoja en móvil, diálogo en escritorio |
| ExpandableText | `components/ui/ExpandableText` | recorte a ~6 líneas con fundido y «Leer más» |
| Skeleton, Toast | `components/ui/…` | carga con brillo suave; avisos en región viva |
| StarRating, StarInput | `components/ui/…` | estrellas de lectura (con texto «4,5 de 5 estrellas») y de voto (radios nativos) |
| Header, TabBar, NavLinks, PageHeader, Footer, ScrollToTop, Logo, SkipLink | `components/layout/…` | navegación y estructura de página |
| BookCover, BookCard, BookCarousel, LecturasExplorer, BookDetail | `features/books/components` | portadas con respaldo ilustrado si no hay imagen o falla |
| ReviewsSection, ReviewList | `features/reviews/components` | valoraciones |
| PrivacyPage | `features/legal/components` | política de privacidad |
| InstagramCarousel, PhotoGallery, DocumentList | `features/instagram`, `gallery`, `documents` | galería y documentos |

### Navegación
- Móvil: **TabBar** con Inicio · Lecturas · Galería · El club (Perfil o Entrar se añadirá con el área de miembros; 5 como máximo). Icono + etiqueta; la activa en granate.
- **Large title**: el título en Caveat se compacta en una barra fina con título en Inter al hacer scroll (IntersectionObserver).
- Escritorio: barra superior translúcida con el sillón y el nombre del club a la izquierda y la navegación centrada.
- **Pie** discreto: una línea en texto pequeño, sin fondo, con el nombre del club y «Escríbenos · Instagram · Privacidad». El nombre es un botón (`ScrollToTop`, con flecha ↑) que vuelve al principio de la página y lleva el foco al contenido; sin animación si se prefiere menos movimiento. Sin dirección ni más enlaces legales; en móvil deja hueco para la TabBar.

### Inicio
- Logo completo grande (con versión oscura) y el nombre del club como `h1` oculto visualmente (sin claim, por decisión del club).
- Carrusel «Lo último que hemos leído» con «Ver todas».
- Pendiente: tarjeta «Próxima sesión» (portada, «miércoles 25 de noviembre · 19:30», lugar, «Añadir al calendario»).

### Lecturas
- Control segmentado (Próximo · Leídos · Propuestas; se abre en Próximo si hay próxima lectura), buscador estilo iOS y recuento en región viva.
- La atribución «Datos de libros: Google Libros.» solo aparece al final de Leídos.
- Rejilla de portadas con título, autor y media de estrellas; agrupación por año con cabeceras fijas cuando hay fecha de sesión.
- Estados vacíos amables («Aún no hay propuestas. ¡Escribe al club!» con enlace).

### Ficha de libro
- Cabecera: la propia portada muy difuminada como fondo; portada grande con sombra de objeto. En escritorio, portada a la izquierda y a la derecha estado (pill), título (Inter), autor, «editorial · año · páginas» y botones «Ver en Google Libros» y «Pídelo en la Librería Celama».
- Cuerpo: Sinopsis (con «Leer más»), «Lo que dice la crítica» (3 citas + desplegable), Nota del club (Caveat) y Valoraciones. En escritorio, a la derecha, **Ficha técnica** fija (autoría, editorial, año, páginas, ISBN, idioma, género, sesión) con la atribución «Datos y portada: Google Libros».
- Sin datos no se inventa nada: cada sección solo aparece si hay contenido.

### Valoraciones
- Resumen con estrellas y «4,5 · 2 valoraciones»; lista de opiniones (nombre «Nombre I.», estrellas, fecha, texto).
- Sin sesión: botón principal «Entrar con Google para valorar» y aviso de privacidad con enlace a `/privacidad`. Con sesión: estrellas (radios nativos), opinión opcional, aviso del nombre con el que se publicará, guardar / borrar / salir.

### Galería
- Carrusel de Instagram en formato cuadrado con «Síguenos» (sin datos: tarjeta «Ver en Instagram»).
- Fotos de las sesiones agrupadas por fecha.

### Hojas modales, formularios y estados
- Hojas: suben desde abajo en móvil y son diálogo centrado en escritorio; `<dialog>` nativo (trampa de foco y Esc).
- Formularios: etiquetas visibles, campos de 52 px, `autocomplete` correcto, errores en línea con `aria-live`.
- Vacío: icono o ilustración y mensaje amable. Error: mensaje claro y «Reintentar». Carga: esqueletos, nunca spinners a pantalla completa.

## 5. Accesibilidad (WCAG 2.2 AA)
- HTML semántico; un solo `h1` por página y jerarquía sin saltos.
- «Saltar al contenido» como primer elemento enfocable.
- Foco visible (anillo de 3 px `--color-foco`, separación de 2 px); nunca `outline: none` sin sustituto.
- Teclado completo: carrusel, control segmentado, estrellas, hojas modales.
- `alt` de portadas: «Portada de *Título*, de Autor» (vacío si la tarjeta ya muestra el título). Instagram: `alt` desde el pie de foto (máx. 150 caracteres).
- Texto ampliable al 200 %; reflujo a 320 px sin scroll horizontal; objetivos ≥ 24 px (2.5.8) y 44 px como norma propia.
- `lang="es"`; títulos en otro idioma con su `lang`.
- Comprobación: `@axe-core/playwright` en todas las páginas en claro y oscuro (`e2e/`) + revisión manual con VoiceOver antes de cada lanzamiento.

## 6. Rendimiento
- Core Web Vitals en verde: LCP < 2,5 s, INP < 200 ms, CLS < 0,1.
- Server Components por defecto; JS de cliente solo en piezas interactivas.
- Fuentes con `next/font` (autoalojadas, `display: swap`, solo pesos usados).
- Sin optimizador de imágenes (web estática): las imágenes propias se sirven ya optimizadas (`pnpm assets`, `pnpm content`); las portadas de Google se piden al tamaño mayor disponible.

## 7. Guía de estilo viva
`/estilo/` (con `noindex`) muestra paleta clara y oscura, escala tipográfica, botones, formularios, control segmentado, tarjetas, portadas, carrusel, hoja modal, avisos, esqueletos y estados. Todo componente nuevo de `components/ui` se añade ahí.
