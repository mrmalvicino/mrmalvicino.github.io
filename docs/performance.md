# Performance audit

## Method

MRM-19 was measured with Lighthouse 12.8.2 against the production build served by `test/support/server.mjs` on localhost. The baseline and optimized runs used the same machine, Chromium installation, server, routes, and Lighthouse presets.

The local server intentionally does not simulate CDN compression or browser caching. These are laboratory results, not real-user Core Web Vitals. Lighthouse does not provide a reliable INP value without field data, so Total Blocking Time (TBT) is included as a laboratory responsiveness proxy. Real-user LCP, CLS, and INP should be reviewed in PageSpeed Insights or Search Console after publication and sufficient traffic.

Each route was measured with the mobile default and `--preset=desktop`:

```bash
npm run build
node test/support/server.mjs
npx --yes lighthouse@12.8.2 http://127.0.0.1:4174/es/ --only-categories=performance --output=json
npx --yes lighthouse@12.8.2 http://127.0.0.1:4174/es/projects/ --only-categories=performance --output=json
npx --yes lighthouse@12.8.2 http://127.0.0.1:4174/es/cv/ --only-categories=performance --output=json
```

The desktop runs used the same commands with `--preset=desktop`. Spanish was selected because both languages share renderers and resources; automated tests cover all six localized pages.

## Results

| Route | Profile | Score | FCP | LCP | CLS | TBT | Transfer | Requests |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Portfolio | Mobile baseline | 73 | 2.36 s | 7.14 s | 0.0351 | 0 ms | 1,677 KiB | 59 |
| Portfolio | Mobile optimized | 96 | 1.06 s | 2.71 s | 0.0000 | 0 ms | 711 KiB | 34 |
| Portfolio | Desktop baseline | 83 | 1.46 s | 2.07 s | 0.0129 | 0 ms | 1,678 KiB | 59 |
| Portfolio | Desktop optimized | 100 | 0.33 s | 0.61 s | 0.0000 | 0 ms | 763 KiB | 40 |
| Projects | Mobile baseline | 64 | 3.45 s | 6.23 s | 0.0481 | 0 ms | 3,877 KiB | 109 |
| Projects | Mobile optimized | 96 | 1.05 s | 2.70 s | 0.0000 | 0 ms | 1,832 KiB | 50 |
| Projects | Desktop baseline | 51 | 1.97 s | 3.66 s | 0.3319 | 0 ms | 3,877 KiB | 109 |
| Projects | Desktop optimized | 92 | 0.28 s | 1.74 s | 0.0007 | 105 ms | 2,526 KiB | 85 |
| CV | Mobile baseline | 93 | 2.21 s | 2.88 s | 0.0004 | 0 ms | 428 KiB | 23 |
| CV | Mobile optimized | 94 | 0.91 s | 3.16 s | 0.0000 | 0 ms | 382 KiB | 7 |
| CV | Desktop baseline | 96 | 1.06 s | 1.06 s | 0.0001 | 0 ms | 428 KiB | 23 |
| CV | Desktop optimized | 100 | 0.24 s | 0.62 s | 0.0000 | 0 ms | 382 KiB | 7 |

The CV mobile LCP varied upward by 0.28 seconds in this run while FCP, CLS, request count, transfer size, and the overall score improved. This laboratory variation remains a follow-up measurement point after publication rather than evidence of a field regression.

## Implemented optimizations

- The build converts local PNG and JPEG publication images to WebP with `sharp`; the 832 KiB profile source becomes a 24 KiB, 500 by 500 publication image.
- Original raster sources remain editable under `src/assets/images/` but are excluded from `dist/`. Published images decreased from 2,680 KiB of source rasters to 720 KiB.
- Image and iframe markup reserves intrinsic space. Below-the-fold images and YouTube embeds use native lazy loading; images also use asynchronous decoding.
- The profile image remains eager and receives high fetch priority because it is the portfolio LCP candidate.
- Jost, Open Sans, and Bootstrap Icons are self-hosted from locked npm packages. Only the used font variants and icon CSS rules are emitted, and their licenses are copied to `dist/assets/licenses/`.
- The 13 to 16 local stylesheets previously loaded by each page are assembled into one ordered page bundle during the build.
- Page scripts are deferred from the document head, preserving progressive enhancement without blocking HTML parsing.
- The generated artifact decreased from 11,800 KiB to 9,808 KiB.

## External-resource decisions

Technology logos and historical project mockups that are already remote remain external. They are noncritical, lazy-loaded resources, several represent third-party trademarks, and copying them without a complete redistribution review would add licensing and maintenance risk. The shared profile, site logo, institution logos, current project images, fonts, and interface icons are local because they affect initial identity, layout stability, or core availability.

YouTube embeds remain on `youtube-nocookie.com` and use native iframe lazy loading. This preserves inline playback and accessible titles while preventing off-screen players from loading during the initial viewport in the measured mobile flow. Formspree, social profiles, maps, repositories, demos, and official websites are navigation or form destinations rather than initial static-resource dependencies.
