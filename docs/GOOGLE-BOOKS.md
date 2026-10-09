# Integración con Google Books API

**Fuente única** de los datos de libros: título, subtítulo, autoría, editorial, fecha, sinopsis, ISBN, páginas, categorías, idioma, portada y enlace. No se usa ninguna otra API de libros. Si Google Libros no tiene algo, se completa a mano (columnas manuales o `content/portadas/`), nunca desde otra fuente.

Referencia oficial: https://developers.google.com/books/docs/v1/using y el recurso `Volume`.

Estado: ✅ implementado en `src/lib/books-api` y `scripts/build-books.ts` · ⏳ previsto para la Fase 3 (sync con la Sheet, Supabase, `/admin`).

---

## 1. Acceso
- Solo datos públicos → basta una **clave de API** (`GOOGLE_BOOKS_API_KEY`), sin OAuth.
- La clave va **solo** en scripts: secreto de GitHub Actions o variable en la línea de comandos local. Nunca en un archivo del repo ni en el navegador.
- Restringirla en Google Cloud Console: *Restricciones de API → solo Books API*.
- Cuota por defecto: 1.000 consultas/día, con límite también **por minuto**. Una carga completa de las 25 lecturas cuesta ≈ 115 consultas; después, solo lo nuevo o cambiado.
- Google filtra por la IP del servidor (GitHub Actions está en EE. UU.): se envía siempre `country=ES`.

## 2. Endpoints
| Uso | Petición |
|---|---|
| Buscar candidatos | `GET https://www.googleapis.com/books/v1/volumes?q=…&key=…` |
| Ficha completa | `GET https://www.googleapis.com/books/v1/volumes/{volumeId}?key=…` |

Parámetros fijos: `printType=books`, `maxResults=20`, `projection=full`, `country=ES` y respuesta parcial con `fields=items(id,volumeInfo(title,subtitle,authors,publisher,publishedDate,description,industryIdentifiers,pageCount,categories,language,imageLinks,canonicalVolumeLink)),totalItems`.

> La búsqueda solo devuelve `thumbnail` y `smallThumbnail`. Los tamaños grandes (`small` … `extraLarge`) solo llegan pidiendo el volumen por id: por eso el flujo siempre termina con `GET /volumes/{id}`.

## 3. Consultas ✅
Orden de intentos (para en cuanto un candidato llega a 70 puntos):

1. **Volumen fijado**: si la fila trae `google_books_id` → `GET /volumes/{id}` directamente, sin buscar (solo se busca si hace falta una portada mayor, § 6). Es la vía para corregir ediciones.
2. **ISBN**: `q=isbn:9788433920232`.
3. **Título exacto + apellido** en español: `intitle:"{titulo}" inauthor:"{apellido}"` con `langRestrict=es`.
4. **Palabras clave** del título (sin artículos) + apellido, con `langRestrict=es`.
5. **Sin restricción de idioma**: como 3, sin `langRestrict`.
6. **Texto libre**: `{titulo} {apellido}` sin operadores. Los operadores de campo de Google a veces devuelven 0 resultados; este intento lo cubre.

Normalización (`normalize.ts`): sin tildes, minúsculas, sin puntuación; artículos fuera solo para comparar. Apellido principal del primer autor para `inauthor` («Kazuo Ishiguro» → `Ishiguro`; «Dominique Lapierre y Larry Collins» → `Lapierre`; «Madame de La Fayette» → `Fayette`).

## 4. Puntuación ✅
| Criterio | Puntos |
|---|---|
| Similitud de título (conjuntos de palabras; tolera subtítulos cortos) | hasta 40 |
| Algún autor coincide (apellido) | 25 |
| `language == "es"` | 10 |
| Tiene `imageLinks` | 10 |
| Sinopsis de más de 200 caracteres | 8 |
| Tiene ISBN-13 | 4 |
| `pageCount` > 0 | 3 |

- Penalización −40 si el título contiene «resumen», «guía de lectura», «study guide», «summary», «edición escolar» o «cuaderno».
- Topes (tras probar con las lecturas reales): similitud de título < 0,5 → como mucho 49 (nunca se acepta, aunque coincida la autora); edición en otro idioma → como mucho 69 (se acepta, pero se revisa); la similitud baja si el título candidato es mucho más largo que el buscado.
- Umbrales: **≥ 70** aceptado · **50–69** aceptado y `revisar` · **< 50** sin datos y `revisar`. Se guardan los 5 mejores candidatos (`candidatos`) para poder elegir otra edición.

## 5. Mapeo ✅ (`map-volume.ts`)
| Dato | Origen en `volumeInfo` | Tratamiento |
|---|---|---|
| `googleBooksId` | `id` | — |
| `tituloGoogle`, `subtitulo` | `title`, `subtitle` | en la web se muestra el título de la Sheet |
| `autor` | `authors[]` | «A, B y C» (en la web se muestra el de la Sheet) |
| `editorial` | `publisher` | — |
| `anio` | `publishedDate` | primeros 4 dígitos (año **de la edición**) |
| `descripcion` | `description` | § 6 |
| `isbn` | `industryIdentifiers` | ISBN-13, si no ISBN-10 (gana el de la Sheet) |
| `paginas` | `pageCount` | se ignora si es 0 |
| `categorias` | `categories[]` | traducidas con `categories-es.ts` («Fiction» → «Ficción») |
| `idioma` | `language` | ISO-639-1; en la ficha, «Español», «Inglés»… |
| `enlaceGoogle` | `canonicalVolumeLink` | botón «Ver en Google Libros» y atribución |
| `portadaUrl` | `imageLinks` | § 6 |

Prioridad absoluta de lo manual: `portada_manual`, `descripcion_manual` y las portadas de `content/portadas/{slug}` sustituyen a lo de Google.

## 6. Portadas y sinopsis
**Portada** ✅
1. Mayor tamaño disponible del volumen completo: `extraLarge` → `large` → `medium` → `small` → `thumbnail`.
2. URL limpia: `https://` y sin `edge=curl` (borde doblado).
3. Si la edición elegida **o fijada con `google_books_id`** solo tiene miniatura (~128 px), se busca la misma obra en español (título casi idéntico y mismo autor) y se usa su portada grande; suele ser el ebook de la editorial. Los datos (páginas, ISBN, editorial) siguen siendo los de la edición elegida. Ejemplo: *Sinsonte* (papel, 352 páginas) con la portada del ebook de Impedimenta.
4. Si no hay portada grande en ninguna edición en español, se mantiene la miniatura o, sin ella, la de otra edición fiable (≥ 70).
5. `COVERS_MODE=remote` (hoy): la imagen se enlaza desde `books.google.com`. Si no carga en el navegador, `BookCover` muestra la portada ilustrada (nunca una imagen rota).

⏳ Previsto con `COVERS_MODE=storage` (Fase 3): descargar, descartar el placeholder «imagen no disponible» de Google (por tamaño o hash), convertir con `sharp` a WebP de 800 px con LQIP y color dominante, y servir desde Supabase Storage.

**Sinopsis** ✅
- `description` puede traer HTML: se convierte a **párrafos de texto plano** (más estricto que una lista blanca: la web nunca inserta HTML de terceros), con entidades decodificadas y sin comillas sueltas.
- Contraportadas de editorial (`separarCitas`): fuera los eslóganes en mayúsculas («30 ANIVERSARIO»); las citas de prensa («…» + firma) van aparte a «Lo que dice la crítica».
- Sin sinopsis en la edición elegida → la de otra edición fiable. Sin sinopsis en ningún caso → la ficha no muestra la sección.

## 7. Caché, errores y cuota ✅
- Las fichas se guardan en **`data/google-books.json`, versionado en el repo**, indexadas por `hash_origen = sha1(titulo, autor, isbn, google_books_id, portada_manual, descripcion_manual)`. Cada publicación tiene portadas y datos aunque falte la clave o Google falle.
- Solo se consulta Google si el hash es nuevo o cambió; los libros sin resultado se reintentan pasadas 24 h; los de más de 180 días se refrescan de 10 en 10.
- Para fijar libros nuevos de forma permanente: `GOOGLE_BOOKS_API_KEY=… pnpm books` en local y commit de `data/google-books.json`. En CI, con el secreto, también se completan, pero no se guardan en el repo.
- El JSON se limpia solo de fichas de filas que ya no existen y se ordena por título (diffs legibles).
- 750 ms entre libros; reintentos ante `5xx` (1, 2, 4 s) y ante `429` (15, 30, 60 s); `403` o `429` persistente detienen las consultas sin romper el build. Timeout de 8 s.
- `pnpm books` imprime un informe: publicadas, con portada, sin publicar, a revisar (con el motivo) y consultas hechas. ⏳ En la Fase 3 irá a `sync_runs` y a `/admin`.

## 8. Código
```
src/lib/books-api/
├── client.ts            # fetch con clave, country, fields, timeout, reintentos y QuotaError
├── types.ts             # Volume, BookData, Candidate, EnrichResult
├── query-builder.ts     # intentos del § 3
├── normalize.ts         # tildes, artículos, apellidos, similitud de títulos
├── score.ts             # puntuación, topes y umbrales del § 4
├── map-volume.ts        # Volume → BookData (§ 5)
├── cover.ts             # elección y limpieza de la URL de portada
├── description.ts       # sinopsis a párrafos y separarCitas()
├── categories-es.ts     # diccionario de categorías
├── find-best-volume.ts  # orquesta: fijado → intentos → puntuación → ficha completa → respaldos
├── __fixtures__/        # volúmenes de ejemplo para los tests
└── index.ts             # API pública

src/features/books/services/build-lecturas.ts   # Sheet/CSV + fichas + portadas propias → lecturas publicadas
scripts/build-books.ts                          # E/S: CSV, caché data/google-books.json, consultas, informe
```

## 9. Condiciones de uso
- Cada ficha enlaza a Google Libros («Ver en Google Libros») y muestra «Datos y portada: Google Libros»; la pestaña Leídos de `/lecturas` indica al final «Datos de libros: Google Libros».
- Las portadas se enlazan desde Google, no se copian (`COVERS_MODE=remote`). Revisar las condiciones de la API antes de cambiar a `storage`.

## 10. Tests
- Unitarios en `src/lib/books-api/*.test.ts`: normalización, consultas, puntuación y topes, mapeo, portadas, sinopsis y citas, cliente (clave, país, reintentos, cuota) y respaldos de portada y sinopsis.
- `src/features/books/services/build-lecturas.test.ts`: publicación, prioridad de lo manual, slugs.
- No hay test con red real en CI: para probar contra Google, `GOOGLE_BOOKS_API_KEY=… pnpm books` con `data/google-books.json` borrado o en una copia.

## 11. Columnas de la Sheet (o de `data/seed-lecturas.csv`)
| Columna | Uso |
|---|---|
| `titulo`, `autor` | obligatorias; base de la búsqueda (y lo que se muestra) |
| `isbn` | opcional; mejora la precisión |
| `google_books_id` | opcional; fija la edición exacta. Se copia de la URL de Google Libros (`books.google.com/books?id=XXXX`) |
| `portada_manual`, `descripcion_manual` | opcional; sustituyen a lo de Google |
| `revisar` | nota interna; marca el libro para revisar en el informe |
