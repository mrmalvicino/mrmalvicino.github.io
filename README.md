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

The validation also applies the JSON Schemas in `schemas/`, checks stable ID and order uniqueness, verifies typed references between entities, and compares structural fields shared by the English and Spanish records.

## Data model

The nine localized data categories remain as English/Spanish pairs under `data/`. This preserves the current browser consumers while giving every domain entity a stable identity and explicit ordering.

| Category | Identified entities | Main relationships |
| --- | --- | --- |
| `projects` | Projects | `technologies_ids` references technology images; `mockup_id` references project images |
| `studies` | Studies | `institution_id` references institution images |
| `jobs` | Work experiences | Structured `start_date` and nullable `end_date` use `YYYY-MM` |
| `menu` | Navigation entries | `href` references a section in `index.html` |
| `skills` | Skill stacks | `banner_items` references technology images |
| `images` | Common, technology, institution, and project images | IDs are unique across every image group |
| `labels`, `textboxes`, `buttons` | Presentation bindings | IDs reference existing DOM contracts where applicable |

Data conventions:

- Domain IDs use stable, language-independent `kebab-case` values. Existing DOM binding IDs remain `camelCase` for compatibility.
- Ordered domain collections use a positive, unique `order` value. Renderers sort by this property instead of relying on array position.
- Relationships use IDs and are validated against the appropriate target category, not a shared untyped namespace.
- Localized pairs contain the same entity IDs. Structural fields such as references, visibility, dates, URLs, and order must match between languages.
- Visibility and classification are represented by booleans and enums rather than display text.
- Schemas reject unknown properties, missing required fields, invalid types, malformed IDs, invalid dates, and unsupported study types.

The migration is additive: existing property names and localized files remain available, so the current renderers and deployment routes stay compatible. The schemas are development inputs and are intentionally excluded from the publishable `dist/` artifact.

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

The build output is written to `dist/`. It contains the HTML pages, localized data, scripts, styles, assets, and `CNAME`; development tooling is not included. The directory is generated and must not be committed.

The site loads JSON and `footer.html` with `fetch`, so it must be served over HTTP rather than opened directly with a `file://` URL. For example:

```bash
npx serve dist
```

GitHub Pages currently publishes the repository root from `main`. This remains unchanged to avoid altering the existing deployment; `dist/` is the reproducible artifact for validation and a future GitHub Actions deployment.
