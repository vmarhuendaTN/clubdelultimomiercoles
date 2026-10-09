# Sistema de diseño — Club del Último Miércoles

Referencia: las Human Interface Guidelines de Apple y apps como Libros, Música o App Store, filtradas por la calidez del logo (sillón mostaza, trazo a mano). Resultado buscado: limpio, aireado, táctil, con contenido protagonista (las portadas) y un guiño manuscrito en los titulares.

## 1. Principios
1. **El contenido manda**: portadas grandes, interfaz discreta, mucho espacio en blanco.
2. **Claridad**: una acción principal por pantalla, jerarquía tipográfica evidente.
3. **Profundidad sutil**: capas translúcidas con desenfoque, sombras suaves y transiciones que explican de dónde viene cada cosa.
4. **Sensación de app**: navegación inferior fija en móvil, títulos grandes que se compactan al hacer scroll, hojas modales que suben desde abajo, PWA instalable.

## 2. Tokens (`src/styles/tokens.css`)

### Color
```css
:root {
  /* Marca */
  --color-mostaza: #F2B84B;
  --color-mostaza-fuerte: #E0A332;
  --color-naranja: #E8892B;
  --color-granate: #8E2B26;

  /* Superficies */
  --color-fondo: #FBF7EF;          /* papel */
  --color-superficie: #FFFFFF;
  --color-superficie-2: #F4EEE3;
  --color-material: rgb(251 247 239 / 0.72);  /* barras translúcidas */

  /* Texto */
  --color-texto: #1C1A17;
  --color-texto-2: #6B645A;
  --color-texto-3: #9A9286;
  --color-sobre-mostaza: #1C1A17;

  /* Líneas y estados */
  --color-separador: rgb(28 26 23 / 0.10);
  --color-foco: #8E2B26;
  --color-exito: #2F7D4F;
  --color-error: #B3261E;
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-fondo: #141210;
    --color-superficie: #1E1B18;
    --color-superficie-2: #2A2622;
    --color-material: rgb(20 18 16 / 0.72);
    --color-texto: #F5EFE4;
    --color-texto-2: #B9B0A2;
    --color-texto-3: #847B6F;
    --color-separador: rgb(245 239 228 / 0.12);
    --color-granate: #E07A72;
    --color-foco: #F2B84B;
  }
}
```
Todas las combinaciones texto/fondo deben pasar AA (4,5:1 texto normal, 3:1 texto ≥ 24 px y componentes).

### Tipografía
Escala inspirada en la de iOS, fluida con `clamp()`:

| Token | Fuente | Tamaño (móvil → escritorio) | Peso | Uso |
|---|---|---|---|---|
| `--text-display` | Caveat | 44 → 72 px | 700 | portada de inicio |
| `--text-large-title` | Caveat | 36 → 52 px | 700 | título de página |
| `--text-title-1` | Inter | 26 → 32 px | 700 | secciones |
| `--text-title-2` | Inter | 21 → 24 px | 600 | tarjetas destacadas |
| `--text-headline` | Inter | 17 px | 600 | títulos de libro |
| `--text-body` | Inter | 17 px | 400 | texto |
| `--text-callout` | Inter | 16 px | 400 | |
| `--text-subhead` | Inter | 15 px | 400 | autor, metadatos |
| `--text-footnote` | Inter | 13 px | 400 | |
| `--text-caption` | Inter | 12 px | 500 | etiquetas |

- Interlineado: 1,5 en cuerpo y 1,15 en títulos. Tracking ligeramente negativo en Inter ≥ 26 px (`-0.02em`).
- Caveat solo en `display`, `large-title` y citas destacadas. Nunca en botones, menús ni formularios.
- Unidades en `rem` para respetar el zoom del navegador.

### Espaciado (rejilla de 4/8 pt)
`--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` · `--space-5: 20px` · `--space-6: 24px` · `--space-8: 32px` · `--space-10: 40px` · `--space-12: 48px` · `--space-16: 64px` · `--space-24: 96px`

Márgenes laterales de página: 20 px en móvil, 32 px en tableta, centrado con `max-width: 1200px` en escritorio.

### Radios
`--radius-sm: 8px` (etiquetas) · `--radius-md: 12px` (inputs, botones) · `--radius-lg: 20px` (tarjetas) · `--radius-xl: 28px` (hojas modales) · `--radius-full: 999px` (pills). Portadas de libro: `6px` (son objetos físicos, no tarjetas).

### Sombras y materiales
```css
--shadow-1: 0 1px 2px rgb(0 0 0 / .06), 0 1px 1px rgb(0 0 0 / .04);
--shadow-2: 0 4px 12px rgb(0 0 0 / .08), 0 1px 3px rgb(0 0 0 / .06);
--shadow-3: 0 12px 32px rgb(0 0 0 / .12), 0 2px 6px rgb(0 0 0 / .08);
--shadow-portada: 0 10px 24px -6px rgb(60 40 10 / .35);
--blur-material: saturate(180%) blur(20px);
```
Barras de navegación y TabBar: `background: var(--color-material); backdrop-filter: var(--blur-material);` con un separador de 0,5 px. Respaldo opaco con `@supports not (backdrop-filter: blur(1px))`.

### Movimiento
```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 400ms;
```
- Pulsación: `transform: scale(0.97)` en tarjetas y botones.
- Transiciones entre páginas con View Transitions API: la portada de la lista "vuela" a la ficha del libro.
- `@media (prefers-reduced-motion: reduce)` desactiva escalas, vuelos y parallax y deja solo fundidos.

### Capas
`--z-base: 0` · `--z-sticky: 100` · `--z-tabbar: 200` · `--z-overlay: 300` · `--z-sheet: 400` · `--z-toast: 500`

## 3. Responsive
| Breakpoint | Ancho | Navegación | Rejilla de portadas |
|---|---|---|---|
| móvil | < 768 px | TabBar inferior + título grande | 2 columnas |
| tableta | 768–1023 px | TabBar inferior o barra lateral en horizontal | 3–4 columnas |
| escritorio | ≥ 1024 px | barra superior translúcida | 5–6 columnas |

- Media queries por **contenedor** (`@container`) dentro de los componentes; por viewport solo en `layout.css`.
- `env(safe-area-inset-*)` en TabBar, cabecera y hojas modales (iPhone con notch e isla dinámica).
- Áreas táctiles de 44 × 44 px como mínimo.
- Imágenes con `sizes` correctos y `aspect-ratio: 2 / 3` en portadas para evitar saltos (CLS = 0).

## 4. Patrones de interfaz

**Navegación**
- Móvil: **TabBar** con las pestañas Inicio · Lecturas · Galería · El club, y Perfil (o Entrar) cuando exista el login (5 como máximo). Icono + etiqueta, la activa en granate.
- **Large title**: el título de la página en Caveat se compacta a una barra fina con título centrado en Inter al hacer scroll (IntersectionObserver, sin escuchar el evento scroll).
- Escritorio: barra superior translúcida fija con el logo a la izquierda y la navegación centrada.

**Inicio**
- Cabecera con la ilustración del sillón y el claim en Caveat.
- Tarjeta "Próxima sesión" grande: portada, fecha en formato humano ("miércoles 25 de noviembre · 19:30"), lugar y botón "Añadir al calendario".
- Carrusel horizontal "Lo último que hemos leído" con scroll-snap, tipo App Store.
- (Instagram vive en la pestaña **Galería**, como carrusel.)

**Lecturas**
- Control segmentado (Leídos · Próximo · Propuestas) y buscador con estilo de barra de búsqueda iOS.
- Rejilla de portadas con título y autor debajo. Esqueletos (shimmer suave) mientras cargan.
- Agrupación por año con cabeceras fijas.

**Galería**
- Carrusel de las últimas publicaciones de Instagram (mismo patrón que el de libros, en formato cuadrado) con enlace «Síguenos».
- Debajo, fotos de las sesiones agrupadas por fecha.

**Ficha de libro**
- Portada centrada con sombra de objeto y fondo difuminado con el color dominante de la portada (extraído al sincronizar).
- Metadatos en "pills": año · páginas · sesión.
- Sinopsis con "Leer más" si supera 6 líneas.

**Hojas modales (bottom sheets)**
- Filtros, compartir y confirmaciones suben desde abajo en móvil y aparecen como diálogo centrado en escritorio. Usar `<dialog>` nativo con gestión de foco.

**Formularios (login)**
- Pantalla limpia: logo, título "Entrar", campos grandes (52 px de alto), botón principal mostaza a todo el ancho.
- Etiquetas visibles siempre (no solo placeholder), `autocomplete` correcto (`email`, `current-password`, `new-password`), botón para mostrar u ocultar la contraseña, errores en línea y anunciados con `aria-live`.

**Estados**
- Vacío: ilustración del sillón con mensaje amable ("Aún no hay propuestas. ¡Escribe al club!").
- Error: mensaje claro con botón "Reintentar".
- Carga: esqueletos, nunca spinners a pantalla completa.

**Iconos**
- Un único set de trazo fino y redondeado (Lucide), a 1,75 px de grosor, en `components/ui/Icon`. No mezclar sets.

## 5. Accesibilidad (WCAG 2.2 AA)
- HTML semántico: `header`, `nav`, `main`, `article`, `footer`; un solo `h1` por página y jerarquía sin saltos.
- Enlace "Saltar al contenido" como primer elemento enfocable.
- Foco visible propio (anillo de 3 px `--color-foco` con separación de 2 px) en todo elemento interactivo; nunca `outline: none` sin sustituto.
- Navegación completa por teclado, incluidos el carrusel, el control segmentado (patrón de tabs ARIA) y las hojas modales (trampa de foco y cierre con Esc).
- `alt` de portadas: "Portada de *Título*, de Autor". Imágenes decorativas con `alt=""`.
- Publicaciones de Instagram: `alt` desde el pie de foto, recortado a 150 caracteres.
- Texto ampliable al 200 % sin pérdida de contenido; reflujo a 320 px sin scroll horizontal.
- Objetivos táctiles ≥ 24 px (criterio 2.5.8) y 44 px como norma propia.
- Idioma `lang="es"`; títulos de libro en otro idioma con `lang` correspondiente si se conoce.
- Comprobación: `@axe-core/playwright` en todas las rutas + revisión manual con VoiceOver (iOS/macOS) antes de cada lanzamiento.

## 6. Rendimiento (forma parte de la UX)
- Core Web Vitals en verde: LCP < 2,5 s, INP < 200 ms, CLS < 0,1.
- Server Components por defecto; JS de cliente solo en piezas interactivas (TabBar, buscador, carrusel, sheets).
- Fuentes con `next/font` (autoalojadas, `display: swap`, solo pesos usados).
- Portadas en WebP/AVIF vía `next/image`, con LQIP (placeholder difuminado) generado en el sync.

## 7. Entregable de la Fase 1
Página `/estilo` (solo desarrollo) que muestre: paleta clara y oscura, escala tipográfica, botones en todos sus estados, inputs, tarjetas, portada, TabBar, large title, bottom sheet, control segmentado, esqueletos, toasts y estados vacíos. Es la referencia visual para aprobar antes de construir páginas.
