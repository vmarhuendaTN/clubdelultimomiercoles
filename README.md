# Club del Último Miércoles

Web del club de lectura que se reúne el último miércoles del mes, cada dos meses, en la Librería Celama (Madrid).

**Web**: https://vmarhuendatn.github.io/clubdelultimomiercoles/

## Documentación

| Documento                                      | Para quién               | Qué contiene                                                                              |
| ---------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| [`docs/GUIA-EDITORA.md`](docs/GUIA-EDITORA.md) | editora                  | Cómo añadir lecturas, portadas, fotos y documentos, y moderar valoraciones, sin programar |
| [`content/README.md`](content/README.md)       | editora                  | Subidas públicas desde GitHub                                                             |
| [`CLAUDE.md`](CLAUDE.md)                       | desarrollo / Claude Code | Contexto permanente: stack, estructura, reglas, cómo trabajar                             |
| [`docs/PLAN.md`](docs/PLAN.md)                 | desarrollo               | Estado actual, fases y tareas pendientes                                                  |
| [`docs/DISENO.md`](docs/DISENO.md)             | desarrollo               | Sistema de diseño (referencia viva en `/estilo/`)                                         |
| [`docs/ASSETS.md`](docs/ASSETS.md)             | desarrollo               | Imágenes, logo y recursos                                                                 |
| [`docs/GOOGLE-BOOKS.md`](docs/GOOGLE-BOOKS.md) | desarrollo               | Fichas de libros desde Google Books                                                       |

## Stack

Next.js 15 (exportación estática) · TypeScript · CSS Modules con tokens · GitHub Pages + GitHub Actions · Supabase (valoraciones y login con Google) · Google Books API · Vitest y Playwright + axe · pnpm.

## Desarrollo

Requisitos: Node 22 y pnpm 10. Copia `.env.example` a `.env.local`.

```sh
pnpm install
pnpm dev                      # http://localhost:3000 (antes procesa content/ y las lecturas)
pnpm lint && pnpm lint:css && pnpm typecheck && pnpm test && pnpm assets:check
pnpm test:e2e                 # build estático + Playwright + axe
pnpm build && pnpm serve:out  # la web tal como en GitHub Pages (pnpm start hace lo mismo tras el build)
pnpm books                    # regenera las lecturas (con GOOGLE_BOOKS_API_KEY=… consulta Google)
pnpm content                  # procesa content/ (documentos, fotos, portadas)
pnpm icons                    # regenera logo, favicons, iconos PWA y og-image desde assets-src/brand/
pnpm assets                   # optimiza y valida imágenes
```

## Publicación

Cada push a `main` publica la web con `.github/workflows/pages.yml` (unos 3 minutos). Cada PR pasa el CI (`.github/workflows/ci.yml`): lint, tipos, tests, recursos y e2e con axe.

Secretos y variables de GitHub Actions: ver `docs/PLAN.md` § Variables de entorno.
