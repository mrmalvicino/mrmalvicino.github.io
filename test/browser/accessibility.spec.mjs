import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
	"/es/",
	"/en/",
	"/es/projects/",
	"/en/projects/",
	"/es/cv/",
	"/en/cv/"
];

for (const route of routes) {
	test(`${route} has no serious automated accessibility violations`, async ({ page }) => {
		await page.goto(route);

		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
			.disableRules(["frame-tested"])
			.setLegacyMode(true)
			.analyze();

		const violations = results.violations.filter(violation => ["serious", "critical"].includes(violation.impact));

		expect(violations).toEqual([]);
	});
}

test("skip link moves keyboard focus to the main content", async ({ page }) => {
	await page.goto("/en/");
	await page.keyboard.press("Tab");

	const skipLink = page.getByRole("link", { name: "Skip to main content" });

	await expect(skipLink).toBeFocused();
	await page.keyboard.press("Enter");
	await expect(page.locator("#main-content")).toBeFocused();
});

test("mobile menu exposes its state and restores focus when dismissed", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 800 });
	await page.goto("/en/");

	const toggle = page.locator("#toggleBtn");

	await expect(toggle).toHaveAccessibleName("Open navigation menu");
	await toggle.click();
	await expect(toggle).toHaveAttribute("aria-expanded", "true");
	await expect(page.locator("#menuLst a").first()).toBeFocused();

	await page.keyboard.press("Escape");
	await expect(toggle).toHaveAttribute("aria-expanded", "false");
	await expect(toggle).toHaveAccessibleName("Open navigation menu");
	await expect(toggle).toBeFocused();
});

test("education and contact controls expose semantic context", async ({ page }) => {
	await page.goto("/en/");

	await expect(page.locator(".education-table thead th")).toHaveText(["Institution", "Study", "Documents"]);
	await expect(page.locator(".education-table tbody th[scope='row']")).toHaveCount(9);
	await expect(page.getByRole("link", { name: /View study plan: Technical Degree in Programming/ })).toHaveCount(1);
	await expect(page.getByLabel("Name *")).toHaveAttribute("autocomplete", "name");
	await expect(page.getByLabel("Email *")).toHaveAttribute("autocomplete", "email");
	await expect(page.getByLabel("Phone *")).toHaveAttribute("autocomplete", "tel");
	await expect(page.getByLabel("Message *")).toHaveAttribute("aria-describedby", "requiredFieldsNote");
});

test("reduced motion preference disables nonessential transitions", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/en/");

	await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");

	const transitionDuration = await page.locator("#resumeBtn").evaluate(element => (
		Number.parseFloat(getComputedStyle(element).transitionDuration)
	));

	expect(transitionDuration).toBeLessThan(0.001);
});
