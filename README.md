# Portfolio

Dependency-free custom Node static site generator for a vanilla HTML, CSS, and JavaScript portfolio and resume.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

Install the locked development dependencies with `npm ci`.

## Architecture

The repository separates content, rendering, and published output:

- `src/data/site.json` is the language-independent domain model and shared configuration.
- `src/data/es.json` and `src/data/en.json` are the only localized professional-content catalogs.
- `src/assets/`, `src/style/`, and `src/script/` contain the static resources and progressive enhancement copied into the public artifact.
- `schemas/` validates the three data files and their relationships.
- `tools/site-data.mjs` resolves IDs, translations, ordering, visibility, images, technologies, and institutions at build time.
- `tools/render-html.mjs` contains pure escaped HTML render functions for the portfolio, project catalog, resume, and shared fragments.
- `tools/build.mjs` validates the source, renders every route, and copies only public assets.
- `src/script/` contains progressive enhancement only: mobile menu behavior and email copying.
- `dist/` is generated publication output, not an editable source.

No page fetches JSON or constructs professional content in the browser. Generated HTML contains the main content, links, images, tables, and lists before JavaScript runs.

## Data

Stable domain IDs use language-independent `kebab-case`; existing control IDs remain `camelCase` where they are part of the DOM contract. Ordered collections use a unique positive `order`, and relationships use validated IDs:

| Collection | Relationships |
| --- | --- |
| `projects` | `technologyIds` references technologies; `mockup_id` references project images |
| `technologies` | `imageId` references a technology image |
| `studies` | `institutionId` references an institution |
| `institutions` | `imageId` references an institution image |
| `skills` | `bannerTechnologyIds` references technologies |
| `menu` | `href` references a portfolio section |

To change professional content, edit only `src/data/site.json`, `src/data/es.json`, or `src/data/en.json`, then run the build. Do not edit generated HTML in `dist/`.

## Build

Run validation independently with:

```bash
npm run validate
```

Generate the publishable artifact with:

```bash
npm run build
```

The build validates first, replaces `dist/`, renders the complete route set, and copies `CNAME` plus the public resources from `src/assets/`, `src/style/`, and `src/script/`. It intentionally excludes source JSON, schemas, build tools, and tests.

Route contract:

| Page | Spanish | English |
| --- | --- | --- |
| Portfolio | `/es/` | `/en/` |
| Projects | `/es/projects/` | `/en/projects/` |
| Resume | `/es/cv/` | `/en/cv/` |

The root route redirects browsers whose primary language starts with `es` to `/es/`; every other language uses `/en/`. Localized routes use conventional links and do not inspect query parameters. Filename-based routes and the `lang` query parameter are not supported.

## Testing

Run all tests with:

```bash
npm test
```

Run layers independently with:

```bash
npm run test:unit
npm run test:browser
```

Unit tests verify validation, all localized outputs, publication exclusions, static localized content, safe routes, and data-driven rebuilds. Playwright builds and serves `dist/`, then verifies root language selection, localized navigation, language switching, entity counts, media precedence, the mobile menu, JavaScript-disabled behavior, and desktop/mobile visual baselines.

Intentional visual changes can be reviewed and accepted with `npm run test:browser:update`. Do not update snapshots to hide an unexplained regression.

## Publication

Publish the contents of `dist/` at the site root. The generated artifact includes `CNAME` and uses root-relative local assets, so every localized route works at its final GitHub Pages URL. The repository root is source and tooling; it is no longer a directly publishable site.
