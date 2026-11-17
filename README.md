# Portfolio

Custom Node static site generator for a vanilla HTML, CSS, and JavaScript portfolio and resume with no published runtime dependencies.

## Requirements

- Node.js 20.16 or newer
- npm 10 or newer
- Chromium installed through Playwright

Install the locked development dependencies and browser with `npm ci` and `npx playwright install chromium`.

## Architecture

The repository separates content, rendering, and published output:

- `src/data/site.json` is the language-independent domain model and shared configuration.
- `src/data/es.json` and `src/data/en.json` are the only localized professional-content catalogs.
- `src/assets/`, `src/style/`, and `src/script/` contain static-resource sources. The build optimizes images, bundles styles, and copies progressive-enhancement scripts into the public artifact.
- `schemas/` validates the three data files and their relationships.
- `tools/site-data.mjs` resolves IDs, translations, ordering, visibility, images, technologies, and institutions at build time.
- `tools/site-manifest.mjs` is the single publication contract for languages, pages, routes, styles, scripts, and resume files.
- `tools/render/` separates pure escaped HTML rendering into page modules, shared visual components, and document primitives.
- `tools/filesystem.mjs` and `tools/static-server.mjs` provide the shared safe filesystem and HTTP primitives used by build verification, PDF generation, and browser tests.
- `tools/build.mjs` validates the source, optimizes and bundles static assets, renders every route, generates both resume PDFs, and copies only public assets.
- Localized SEO titles, descriptions, social metadata, canonical URLs, language alternates, and structured data come from the same shared data model and render pipeline.
- `src/script/` contains progressive enhancement only: mobile menu behavior, project filtering, email copying, and resilient contact-form submission.
- `dist/` is generated publication output, not an editable source.

No page fetches JSON or constructs professional content in the browser. Generated HTML contains the main content, links, images, tables, and lists before JavaScript runs.

### CSS architecture

CSS remains dependency-free and is loaded in the fixed responsibility order declared by `tools/site-manifest.mjs`:

1. Tokens: `variables.css` owns shared colors, type families, spacing, radii, and stable site dimensions.
2. Base: `controls.css` owns the reset, element defaults, and the shared `.page-section` layout primitive.
3. Shared components: `buttons.css`, `images.css`, and `site-chrome.css` own reusable visual components.
4. Page components: each renderer requests only its page styles, such as `portfolio.css`, `project-cards.css`, `projects.css`, `inputs.css`, `table.css`, or `cv.css`.
5. Utilities: color, flex, type, size, margin, and padding utilities load last so their overrides are intentional.

Selectors follow these conventions:

- Component classes use descriptive nouns, such as `.project-card`, `.education-table`, and `.footer-content`.
- Component descendants are scoped through their owning class; element selectors must not impose component layout globally.
- JavaScript state uses the documented `.nav-toggle`, `.hidden`, and `.no-scroll` classes or the native `[hidden]` attribute. JavaScript must not assign visual inline styles.
- Existing utilities remain available for composition, but new utilities should describe a stable purpose rather than embed a breakpoint or arbitrary value in their name.
- Add a global token only when multiple components share the value. Keep one-off dimensions in the component that owns them.

Responsive contracts use `600px` for the compact CV, `800px` for stacked content, `1000px` for the mobile menu, and `1100px` for the intermediate project-filter grid. CSS owns visual changes; JavaScript uses the same `max-width: 1000px` media query only to close the mobile menu after entering desktop layout.

## Data

JSON properties and JavaScript identifiers use `camelCase`. Stable domain IDs, translation keys that represent entities, URL fragments, and DOM IDs use language-independent `kebab-case`. Ordered collections use a unique positive `order`, and relationships use validated IDs:

| Collection | Relationships |
| --- | --- |
| `projects` | `typeIds` references project types; `participationModeId` references a participation mode; `technologyIds` references technologies; `mockupId` references project images; `liveDemo` links to an interactive demo and `websiteUrl` to an official website |
| `projectTypes` | Stable project classifications translated by the locale catalogs |
| `participationModes` | Stable development or participation modes translated by the locale catalogs |
| `technologies` | `imageId` references a technology image |
| `studies` | `institutionId` references an institution |
| `institutions` | `imageId` references an institution image |
| `images` | `defaultProjectImageId` references the project fallback image; every catalog entry uses a stable image ID |
| `skills` | Groups and categories reference technologies; `cvGroupId` identifies the categorized group rendered in the resume |
| `menu` | `href` references a portfolio section |

The shared technology catalog is the source of IDs, display names, and icons used by projects and Skills. Technologies remain in the catalog while referenced by historical projects, even when they are no longer shown as current professional skills.

Every project must have at least one `typeIds` entry. Use the classifications consistently:

| Type | Classification criterion |
| --- | --- |
| `notes` | Academic notes, books, exercise guides, solved exercises, or other study material |
| `web-app` | Browser or HTTP applications with dynamic behavior, including APIs |
| `static-site` | Websites whose primary purpose is presenting or linking static content |
| `desktop-app` | Software executed outside the browser, including desktop, command-line, package, and embedded utilities |
| `research` | Research plans or studies whose primary purpose is producing or evaluating knowledge |

Assign multiple types when more than one criterion describes a project's primary purpose. Project order is controlled exclusively by the unique positive `order` property, not by array position.

Every project also has one participation mode, independent from its type and technologies:

| Mode | Classification criterion |
| --- | --- |
| `freelance-saas` | Independent products developed and operated as software as a service |
| `freelance-one-off` | One-time client engagements delivered as a defined project |
| `employment` | Products developed as part of an employer's team |
| `independent-collaboration` | Projects developed with third parties outside employment |
| `independent-development` | Personal projects developed independently |

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

The build validates first, replaces `dist/`, converts publication raster images to WebP, copies only allowlisted public assets and page scripts, self-hosts the required font and icon files, and creates one ordered CSS bundle per page. It then renders the route set from the shared manifest, serves the generated HTML locally, and uses the locked Playwright Chromium version to create `assets/cv/malvicino-es.pdf` and `assets/cv/malvicino-en.pdf`. It intentionally excludes original publication rasters, unused design sources, source JSON, schemas, build tools, and tests.

Image conversion, font selection, licenses, external-resource decisions, and comparable Lighthouse results are documented in [`docs/performance.md`](docs/performance.md).

Generate and validate the PDFs again from an existing `dist/` without rebuilding the HTML with:

```bash
npm run build:pdf
```

PDF generation blocks external resources for reproducibility and fails on missing local resources. The mandatory validation checks A4 page dimensions, extractable text, nonempty pages, contact information, logical section order, relevant links, and unsupported decorative characters. The files under `dist/assets/cv/` are generated publication output; do not edit them or add independent PDF sources under `src/`.

Route contract:

| Page | Spanish | English |
| --- | --- | --- |
| Portfolio | `/es/` | `/en/` |
| Projects | `/es/projects/` | `/en/projects/` |
| Resume | `/es/cv/` | `/en/cv/` |

The root route redirects browsers whose primary language starts with `es` to `/es/`; every other language uses `/en/`. The legacy `?lang=es` and `?lang=en` parameters remain supported on `/`, `/index.html`, `/projects.html`, and `/cv.html`. Compatibility pages are marked `noindex`; only the localized routes are canonical and included in the generated sitemap.

The build also generates `sitemap.xml` and `robots.txt`. Search Console submission, live crawl results, and search-engine indexing must be verified after publication because they depend on external services and cannot be guaranteed by the repository tests.

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

Unit tests verify validation, manifest and server contracts, all localized outputs, generated and validated PDFs, publication exclusions, static localized content, safe routes, and data-driven rebuilds. The browser-test prehook builds `dist/` once; Playwright serves that same artifact and verifies root language selection, localized navigation, language switching, content invariants, media precedence, the mobile menu, JavaScript-disabled behavior, and desktop/mobile visual baselines. CI verifies and publishes the already-tested artifact without rebuilding it.

Intentional visual changes can be reviewed and accepted with `npm run test:browser:update`. Do not update snapshots to hide an unexplained regression.

### Error handling

Content and translation failures are build-time errors. Validation reports the affected file and property before `dist/` is replaced, and missing or malformed required JSON, invalid relationships, missing translations, local references, or unsafe runtime configuration stop publication.

The generated HTML contains all primary content and navigation before JavaScript runs. Browser scripts only enhance independent components: a menu or filter initialization failure does not remove content, clipboard failures retain the email link, and contact failures preserve entered values and re-enable submission. Contact responses are checked explicitly, have a 15-second timeout, and expose localized status or alert messages without displaying technical details. Diagnostic console messages identify the component and operation without logging form contents or other personal data.

Automated tests cover build validation, contact success, HTTP and network failures in both languages, coherent form state, static content without JavaScript, and normal interactive behavior. External service availability is not treated as a build requirement; contact submission and external media remain optional runtime dependencies.

### Accessibility verification

Playwright runs axe-core against every localized page and fails on serious or critical WCAG 2.2 AA violations in the first-party document. Cross-origin YouTube player internals are excluded because the site cannot inspect or correct them; the containing iframe, its title, and its placement remain audited. The browser suite also verifies the skip link, mobile-menu state and focus restoration, education-table semantics, contact-field identification, reduced motion, keyboard-operated filters, and horizontal reflow at representative viewport widths.

Before publishing accessibility-sensitive changes, complete these manual checks because automated tools cannot prove full conformance:

- Navigate each page using only `Tab`, `Shift+Tab`, `Enter`, `Space`, and `Escape`; confirm a logical order, visible focus, and no keyboard traps.
- Open and close the mobile menu at narrow widths and 400% browser zoom; confirm that every item remains visible and operable.
- Review the six localized pages with VoiceOver or NVDA; confirm landmark, heading, table, link, form-label, required-field, and status announcements.
- Submit invalid and valid contact forms; confirm that browser and Formspree responses are announced and retain understandable field context.
- Enable reduced motion at operating-system level and confirm that content remains available without nonessential movement.

## Publication

Publish the contents of `dist/` at the site root. The generated artifact includes `CNAME` and uses root-relative local assets, so every localized route works at its final GitHub Pages URL. The repository root is source and tooling; it is no longer a directly publishable site.
