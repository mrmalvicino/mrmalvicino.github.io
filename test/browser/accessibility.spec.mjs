import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/en/", "/en/projects/", "/es/cv/?profile=2"]) {
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

test("contact controls expose input and instruction semantics", async ({ page }) => {
	await page.goto("/en/");

	await expect(page.getByLabel("Name *")).toHaveAttribute("autocomplete", "name");
	await expect(page.getByLabel("Email *")).toHaveAttribute("autocomplete", "email");
	await expect(page.getByLabel("Phone *")).toHaveAttribute("autocomplete", "tel");
	await expect(page.getByLabel("Message *")).toHaveAttribute("aria-describedby", "required-fields-note");
});
