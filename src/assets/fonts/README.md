# Fuentes

Alojadas en el repositorio y cargadas con `next/font/local` (`src/lib/fonts.ts`), para que el build
no dependa de Google Fonts (su descarga fallaba a veces y rompía la compilación).

| Archivo                                                   | Fuente     | Ejes                        | Licencia                  |
| --------------------------------------------------------- | ---------- | --------------------------- | ------------------------- |
| `inter-latin.woff2`                                       | Inter      | peso 400–700                | SIL Open Font License 1.1 |
| `newsreader-latin.woff2`, `newsreader-italic-latin.woff2` | Newsreader | peso 400–700, tamaño óptico | SIL Open Font License 1.1 |
| `caveat-latin.woff2`                                      | Caveat     | peso 500–700                | SIL Open Font License 1.1 |

Son las variables de Google Fonts, subconjunto **latino** (incluye español: tildes, ñ, ¿, ¡). Letras de
otros alfabetos (p. ej. la «ł» polaca) se ven con la fuente de respaldo del sistema.

Para actualizarlas: abrir `https://fonts.googleapis.com/css2?family=Inter:wght@400..700` (y el
equivalente para cada fuente) con un navegador moderno, copiar la URL `.woff2` del bloque
`/* latin */` y sustituir el archivo.
