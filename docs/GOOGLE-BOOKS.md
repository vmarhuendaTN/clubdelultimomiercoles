# Integración con Google Books API

**Fuente única** de todos los datos de libros: título, subtítulo, autoría, editorial, fecha, sinopsis, ISBN, páginas, categorías, idioma, portada y enlace. No se usa ninguna otra API de libros. Si Google Libros no tiene algo, se completa a mano desde la Sheet (columnas `*_manual`) y nunca desde otra fuente.

Referencia oficial: https://developers.google.com/books/docs/v1/using (guía) y la referencia del recurso `Volume`.

---

## 1. Acceso
- Solo datos públicos → basta una **clave de API** (`GOOGLE_BOOKS_API_KEY`), sin OAuth. El alcance OAuth `https://www.googleapis.com/auth/books` no se necesita: no usamos bibliotecas de usuario ("Mi biblioteca").
- La clave va **solo en el servidor** (sync y rutas API), nunca en el navegador.
- Restricción de la clave en Google Cloud Console: *Restricciones de API → solo Books API*.
- Cuota por defecto: 1.000 consultas/día. Con la caché por hash (§ 7) el club usará unas pocas decenas al día.
- **Ubicación**: Google filtra resultados según la IP del servidor. Las funciones de sync se ejecutan en región UE (Vercel `fra1` o `cdg1`) y además se envía `country=ES`, para obtener ediciones y disponibilidad de España.

## 2. Endpoints que se usan
| Uso | Petición |
|---|---|
| Buscar candidatos | `GET https://www.googleapis.com/books/v1/volumes?q=…&key=…` |
| Ficha completa de un volumen | `GET https://www.googleapis.com/books/v1/volumes/{volumeId}?key=…` |

Parámetros fijos de búsqueda:
- `printType=books` (excluye revistas)
- `maxResults=20` (máximo permitido: 40)
- `projection=full`
- `country=ES`
- `fields=` con respuesta parcial para no descargar lo que no se usa:
  `items(id,volumeInfo(title,subtitle,authors,publisher,publishedDate,description,industryIdentifiers,pageCount,categories,language,imageLinks,canonicalVolumeLink)),totalItems`

> Importante: la búsqueda solo devuelve `thumbnail` y `smallThumbnail`. Los tamaños `small`, `medium`, `large` y `extraLarge` aparecen **solo** al pedir el volumen por id. Por eso el flujo siempre termina con `GET /volumes/{id}`.

## 3. Construcción de consultas
Sintaxis: términos separados por `+`, frases exactas entre comillas, palabras clave de campo `intitle:`, `inauthor:`, `isbn:`. Todo codificado como URL.

Orden de intentos (se para en el primero que dé un candidato válido, § 4):

1. **Volumen fijado**: si la Sheet trae `google_books_id` → `GET /volumes/{id}` directamente. Sin búsqueda ni puntuación. Es la vía para que la editora corrija ediciones equivocadas.
2. **ISBN**: si trae `isbn` → `q=isbn:9788433920232`.
3. **Título + autor en español**: `q=intitle:"{titulo}"+inauthor:"{apellido}"` con `langRestrict=es`.
4. **Sin comillas en el título** (tolera subtítulos y signos): `q=intitle:{palabras clave}+inauthor:{apellido}` con `langRestrict=es`.
5. **Sin restricción de idioma** (clásicos o libros sin traducción): igual que 3, sin `langRestrict`.

Normalización previa del texto de la Sheet:
- Quitar artículos iniciales solo para comparar, no para buscar.
- Autor: usar el **apellido principal** en `inauthor` ("Kazuo Ishiguro" → `Ishiguro`; "Dominique Lapierre y Larry Collins" → `Lapierre`; "Madame de La Fayette" → `Fayette`).
- Obras colectivas o varias obras en una fila (p. ej. Sófocles) → se marcan `revisar` y conviene fijar `google_books_id` a mano.

## 4. Elección del mejor candidato (puntuación)
Cada resultado recibe una puntuación de 0 a 100:

| Criterio | Puntos |
|---|---|
| Similitud de título (normalizado sin tildes, minúsculas, sin puntuación; Jaro-Winkler o token-set) | hasta 40 |
| Algún autor coincide con el de la Sheet (apellido) | 25 |
| `language == "es"` | 10 |
| Tiene `imageLinks` | 10 |
| Tiene `description` de más de 200 caracteres | 8 |
| Tiene ISBN-13 | 4 |
| Tiene `pageCount` > 0 | 3 |

Penalizaciones: título con "resumen", "guía de lectura", "study guide", "summary", "edición escolar" o "cuaderno" → −40 (evita libros sobre el libro).

Umbrales:
- ≥ 70 → aceptado automáticamente.
- 50–69 → aceptado pero `revisar = true`.
- < 50 en todos los intentos → sin datos automáticos, `revisar = true`, aparece en el informe de `/admin` con los 5 mejores candidatos.

Los candidatos descartados se guardan en `book_candidates` (id, título, autores, editorial, año, miniatura, puntuación) para que `/admin` los muestre y la editora copie el id correcto a la columna `google_books_id` de la Sheet.

## 5. Mapeo de campos
| Campo en `books` | Origen en `volumeInfo` | Tratamiento |
|---|---|---|
| `google_books_id` | `id` | — |
| `titulo` | `title` | Se muestra el de la Sheet si existe; el de Google se guarda en `titulo_google` |
| `subtitulo` | `subtitle` | opcional |
| `autor` | `authors[]` | unidos con ", " y " y " antes del último |
| `editorial` | `publisher` | — |
| `anio` | `publishedDate` | primeros 4 dígitos (puede venir `"2005"`, `"2005-11"` o `"2005-11-15"`) |
| `descripcion` | `description` | sanitizar (§ 6) |
| `isbn` | `industryIdentifiers` | preferir `ISBN_13`, si no `ISBN_10` |
| `paginas` | `pageCount` | ignorar si es 0 |
| `categorias` | `categories[]` | traducir las más comunes a español con un diccionario propio ("Fiction" → "Ficción") |
| `idioma` | `language` | ISO-639-1 |
| `enlace_google` | `canonicalVolumeLink` | botón "Ver en Google Libros" en la ficha |
| `portada_path` | `imageLinks` | § 6 |

Prioridad absoluta de la Sheet: si una fila trae `portada_manual` o `descripcion_manual`, sustituyen a lo de Google.

## 6. Portadas y sinopsis

**Portada**
1. Elegir el mayor tamaño disponible en el volumen completo: `extraLarge` → `large` → `medium` → `small` → `thumbnail`.
2. Limpiar la URL: forzar `https://`, quitar `&edge=curl` (borde doblado) y, si solo hay `thumbnail`, probar a subir el `zoom` (`zoom=1` → `zoom=0` o `zoom=3`) y quedarse con la mayor que responda.
3. Descartar la imagen genérica de "imagen no disponible" de Google: si la descarga mide menos de 120 px de ancho o su hash coincide con el placeholder conocido (guardado en `src/lib/books-api/placeholder-hashes.ts`), se trata como sin portada.
4. Procesar con `sharp`: WebP, 800 px de alto, LQIP en base64 y color dominante (para el fondo de la ficha).
5. Destino según `COVERS_MODE` (§ 9): Supabase Storage `covers/{slug}.webp`, o URL remota de Google servida por `next/image`.

**Sinopsis**
- `description` puede traer HTML. Sanitizar con una lista blanca: `p`, `br`, `i`, `em`, `b`, `strong`. Todo lo demás se elimina.
- Quitar comillas sueltas al principio y al final y espacios duplicados.
- Si el candidato elegido no tiene sinopsis pero otro candidato del mismo título y autor (puntuación ≥ 70) sí, tomar la sinopsis de ese y anotarlo en `fuente_descripcion`.
- Sin sinopsis en ningún caso → la ficha no muestra la sección (no se inventa texto).

## 7. Caché, errores y cuota
- `hash_origen = sha1(titulo + autor + isbn + google_books_id + portada_manual + descripcion_manual)`. Solo se consulta Google si el hash cambia o si la editora pulsa "Reenriquecer" en `/admin`.
- Refresco preventivo: los libros con más de 180 días desde el último enriquecimiento se revisan en lotes de 10 por noche.
- Peticiones en serie, con 250 ms entre llamadas.
- Reintentos con espera exponencial (1 s, 2 s, 4 s) ante `429` y `5xx`; máximo 3. Un `403` por cuota detiene el sync de libros y lo avisa en `/admin` sin romper el resto.
- Timeout de 8 s por petición.
- Todo queda registrado en `sync_runs.resumen`: consultas hechas, aceptados, a revisar y sin resultado.

## 8. Código
```
src/lib/books-api/
├── client.ts              # fetch con clave, country, fields, timeout y reintentos
├── types.ts               # tipos de Volume / VolumeInfo / ImageLinks (solo lo usado)
├── query-builder.ts       # construye las consultas del § 3
├── normalize.ts           # tildes, artículos, apellidos, comparación de títulos
├── score.ts               # puntuación y umbrales del § 4
├── map-volume.ts          # Volume → fila de books (§ 5)
├── cover.ts               # selección, limpieza, descarga y procesado de portada
├── description.ts         # sanitización de la sinopsis
├── categories-es.ts       # diccionario de categorías
├── placeholder-hashes.ts
└── index.ts               # API pública: findBestVolume(), getVolume(), buildCover()

src/features/books/services/
└── enrich-book.ts         # orquesta: hash → intentos → puntuación → volumen → mapeo → portada → guardar
```

## 9. Condiciones de uso
- Revisar las **Condiciones del servicio de la API de Google Books** antes de la Fase 3, en particular lo que dicen sobre **atribución** y **almacenamiento de datos e imágenes**.
- Por eso el almacenamiento de portadas es configurable:
  - `COVERS_MODE=storage`: se copian a Supabase Storage (más rápido y estable).
  - `COVERS_MODE=remote`: se sirven desde la URL de Google a través de `next/image` (`remotePatterns: books.google.com`) y solo se guardan id, metadatos y LQIP.
- Cada ficha muestra el enlace "Ver en Google Libros" (`canonicalVolumeLink`), y el pie de la página de lecturas indica "Datos de libros: Google Libros".

## 10. Tests
- Fixtures JSON reales de 10 libros del club en `src/lib/books-api/__fixtures__/` (incluidos casos difíciles: *El secreto* / Tartt, Sófocles, *Too much*, *Maniac*).
- Tests unitarios de `normalize`, `score`, `map-volume`, `description` y la limpieza de URLs de portada.
- Test de integración con red real, desactivado en CI y ejecutable a mano con `pnpm test:books-live`.

## 11. Columnas de la Sheet relacionadas
| Columna | Uso |
|---|---|
| `titulo`, `autor` | obligatorias; base de la búsqueda |
| `isbn` | opcional; mejora la precisión |
| `google_books_id` | opcional; fija la edición exacta. Se copia de la URL de Google Libros (`books.google.com/books?id=XXXX`) o del panel `/admin` |
| `portada_manual`, `descripcion_manual` | opcional; sustituyen a lo de Google |
