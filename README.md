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

Run the automated tests:

```bash
npm test
```

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
