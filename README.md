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
