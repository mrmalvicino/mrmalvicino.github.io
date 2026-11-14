import { expect, openRenderedPage, stabilizeVisualPage, test } from "./portfolio-test.mjs";

const pages = [
	{ name: "index", path: "", readySelector: "#projectsDiv > .project-card", expectedCount: 3 },
	{ name: "projects", path: "projects/", readySelector: "#projectsDiv > .project-card", expectedCount: 25 },
	{ name: "cv", path: "cv/", readySelector: "#projectsLst > li", expectedCount: 2 }
];

const viewports = [
	{ name: "desktop", width: 1440, height: 900 },
	{ name: "mobile", width: 390, height: 844 }
];

for (const language of ["es", "en"]) {
	for (const pageData of pages) {
		for (const viewport of viewports) {
			test(`${pageData.name} ${language} ${viewport.name} matches its visual baseline`, async ({ page }) => {
				await page.setViewportSize({ width: viewport.width, height: viewport.height });

				await openRenderedPage(
					page,
					`/${language}/${pageData.path}`,
					pageData.readySelector,
					pageData.expectedCount
				);

				await stabilizeVisualPage(page);
				await expect(page).toHaveScreenshot(`${pageData.name}-${language}-${viewport.name}.png`, { fullPage: true });
			});
		}
	}
}
