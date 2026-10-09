# Club del Último Miércoles

Web del club de lectura que se reúne el último miércoles del mes en la Librería Celama (Madrid).
Publicada en GitHub Pages: https://vmarhuendatn.github.io/clubdelultimomiercoles/

## Documentación

- `CLAUDE.md` — contexto permanente (stack, principios, estructura).
- `docs/PLAN.md` — plan de desarrollo por fases y arquitectura.
- `docs/DISENO.md` — sistema de diseño. Referencia viva en `/estilo/`.
- `docs/ASSETS.md` — imágenes y recursos.
- `docs/GOOGLE-BOOKS.md` — integración con Google Books.
- `data/seed-lecturas.csv` — importación inicial de la pestaña «Lecturas» de la Sheet CMS.

## Desarrollo

Requisitos: Node 22 y pnpm 10.

```sh
pnpm install
pnpm dev                 # http://localhost:3000
pnpm lint && pnpm lint:css && pnpm typecheck && pnpm test
pnpm test:e2e            # build estático + Playwright + axe
pnpm build && pnpm serve:out   # prueba la exportación como en GitHub Pages
pnpm assets              # optimiza y valida imágenes (pnpm assets:check en CI)
pnpm icons               # regenera favicons, iconos PWA y og-image desde el logo
```

## Publicación

Cada push a `main` publica la web con `.github/workflows/pages.yml`.
Requisito único: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
