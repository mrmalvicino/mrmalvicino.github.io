import { expect, stabilizeVisualPage, test } from "./portfolio-test.mjs";

const cases = [
	{ name: "index-en-desktop", path: "/en/", width: 1440, height: 900 },
	{ name: "projects-es-mobile", path: "/es/projects/", width: 390, height: 844 },
	{ name: "cv-en-mobile", path: "/en/cv/", width: 390, height: 844 }
];

for (const visualCase of cases) {
	test(`${visualCase.name} matches its visual baseline`, async ({ page }) => {
		await page.setViewportSize({ width: visualCase.width, height: visualCase.height });
		await page.goto(visualCase.path);
		await stabilizeVisualPage(page);
		await expect(page).toHaveScreenshot(`${visualCase.name}.png`, { fullPage: true });
	});
}
