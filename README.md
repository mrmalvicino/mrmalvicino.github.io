# Portfolio

Static HTML, CSS, and JavaScript site for the portfolio and resume. The build copies the current site without transforming its content or routes.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Development

Install the locked dependencies:

```bash
npm ci
```

Run the structural checks, JSON parsing, and local-reference validation:

```bash
npm run validate
```

The validation also applies the JSON Schemas in `schemas/`, checks stable ID and order uniqueness, verifies typed references between entities, and requires complete English and Spanish translation catalogs.

## Data model

The site uses three runtime data files:

- `data/site.json` contains the language-independent domain model, shared profile and contact details, resource references, ordering, visibility, and a separate application configuration section.
- `data/en.json` and `data/es.json` contain only localized content, keyed by the stable IDs from the domain model.
- `script/data-loader.js` loads both sources and resolves the presentation model shared by the portfolio, project catalog, and resume.

| Category | Identified entities | Main relationships |
| --- | --- | --- |
| `projects` | Projects | `technologyIds` references technologies; `mockup_id` references project images |
| `technologies` | Technologies | Each technology references its presentation image through `imageId` |
| `studies` | Studies | `institutionId` references an institution |
| `institutions` | Institutions | Each institution references its presentation image through `imageId` |
| `jobs` | Work experiences | Structured `start_date` and nullable `end_date` use `YYYY-MM` |
| `menu` | Navigation entries | `href` references a section in `index.html` |
| `skills` | Skill stacks | `bannerTechnologyIds` references normalized technologies |
| `images` | Common, technology, institution, and project images indexed by ID within each category | IDs are unique across every image group |
| `profile`, `resumes`, `controls` | Shared site information and configuration | Reused by every page and checked against DOM contracts |

Data conventions:

- Domain IDs use stable, language-independent `kebab-case` values. Existing DOM binding IDs remain `camelCase` for compatibility.
- Ordered domain collections use a positive, unique `order` value. Renderers sort by this property instead of relying on array position.
- Relationships use IDs and are validated against the appropriate target category, not a shared untyped namespace.
- Projects and Skills reference normalized technologies; studies reference normalized institutions. Images remain presentation resources linked through `imageId`.
- Image categories are objects indexed by stable ID; the loader converts each required category to the arrays consumed by the existing binders.
- Every translatable entity has exactly one entry in each locale catalog; missing and unknown translation keys fail validation.
- Visibility and classification are represented by booleans and enums rather than display text.
- Schemas reject unknown properties, missing required fields, invalid types, malformed IDs, invalid dates, and unsupported study types.
- The shared loader joins domain data and translations by stable ID while preserving each page's existing filtering and presentation rules.

The schemas are development inputs and are intentionally excluded from the publishable `dist/` artifact.

Run the complete automated suite. The first execution downloads the pinned Chromium version required by Playwright:

```bash
npm test
```

The suite runs fast build and validation tests first, followed by browser tests for `index.html`, `projects.html`, and `cv.html` in Spanish and English. Browser tests verify rendered entity counts and relationships, navigation, language selection, interactive controls, unhandled JavaScript errors, failed local requests, and desktop/mobile visual baselines.

Run only one layer while diagnosing a failure:

```bash
npm run test:unit
npm run test:browser
```

Playwright starts its own local HTTP server. External fonts, images, styles, and embeds are replaced during tests so network availability does not affect the result; all local site resources still load normally and any local failure fails the test.

Visual references are stored under `test/browser/snapshots/`. Review the generated differences before accepting an intentional content or design change, then update the references with:

```bash
npm run test:browser:update
```

Do not update references to make an unexplained failure pass. Functional assertions and the visual difference should first confirm that the new result is expected.

Generate the publishable site:

```bash
npm run build
```

The build output is written to `dist/`. It contains the HTML pages, shared domain data, translation catalogs, scripts, styles, assets, and `CNAME`; development tooling is not included. The directory is generated and must not be committed.

The site loads JSON and `footer.html` with `fetch`, so it must be served over HTTP rather than opened directly with a `file://` URL. For example:

```bash
npx serve dist
```

GitHub Pages currently publishes the repository root from `main`. This remains unchanged to avoid altering the existing deployment; `dist/` is the reproducible artifact for validation and a future GitHub Actions deployment.
