# Portfolio

Custom Node static site generator for a bilingual portfolio and resume built with vanilla HTML, CSS, and JavaScript. The published site has no runtime dependencies.

## Requirements

- Node.js 20.16 or newer
- npm 10 or newer
- Playwright Chromium

Install the locked dependencies and browser:

```bash
npm ci
npx playwright install chromium
```

## Structure

- `src/data/site.json` contains shared configuration and the language-independent domain model.
- `src/data/es.json` and `src/data/en.json` contain localized professional content.
- `src/assets/`, `src/style/`, and `src/script/` contain source assets and progressive-enhancement scripts.
- `schemas/` validates the source data and its relationships.
- `tools/site-manifest.mjs` defines the languages, pages, routes, styles, scripts, and resume files.
- `tools/render/` generates escaped HTML from the resolved data.
- `tools/build.mjs` creates the complete publishable artifact.
- `dist/` is generated output and must not be edited directly.

The generated HTML contains all primary content before JavaScript runs. CSS is dependency-free and bundled per page in the order defined by the site manifest.

## Data

JSON properties and JavaScript identifiers use `camelCase`. Domain IDs, translation entity keys, URL fragments, and DOM IDs use language-independent `kebab-case`.

Collections use a unique positive `order` when ordering is required. Projects reference validated types, participation modes, technologies, and images through stable IDs. The technology catalog remains the shared source for project and skill names and icons.

To change professional content, edit only the three files under `src/data/`, then validate and rebuild the site.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run validate` | Validates source data and references |
| `npm run build` | Recreates the optimized site and resume PDFs in `dist/` |
| `npm run build:pdf` | Regenerates PDFs from an existing build |
| `npm test` | Runs unit and browser tests |
| `npm run test:unit` | Runs unit and build-contract tests |
| `npm run test:browser` | Builds and runs Playwright tests |
| `npm run test:browser:update` | Reviews and updates intentional visual baselines |
| `npm run verify:dist` | Verifies the publishable artifact |
| `node test/support/server.mjs` | Serves an existing `dist/` for manual testing |

Build before starting the manual test server. Image optimization and performance decisions are documented in [`docs/performance.md`](docs/performance.md).

## Routes

| Page | Spanish | English |
| --- | --- | --- |
| Portfolio | `/es/` | `/en/` |
| Projects | `/es/projects/` | `/en/projects/` |
| Resume | `/es/cv/` | `/en/cv/` |

The root route selects Spanish when the browser's primary language starts with `es`; otherwise, it selects English. Legacy language parameters remain supported, while only localized routes are canonical and included in the sitemap.

## Quality

Tests cover validation, generated output, PDFs, localized content, browser behavior, accessibility, responsive layouts, and visual regressions. Do not update visual snapshots to hide an unexplained difference.

Before publishing accessibility-sensitive changes, also verify keyboard navigation, mobile behavior at high zoom, screen-reader announcements, form feedback, and reduced motion manually.

## Publication

Publish the contents of `dist/` at the site root. The repository root contains source code and tooling and is not directly publishable.
