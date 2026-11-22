import { expect, test } from "./portfolio-test.mjs";

async function fillContactForm(page) {
	await page.locator("#name-input").fill("Test User");
	await page.locator("#email-input").fill("test@example.com");
	await page.locator("#phone-input").fill("+54 11 5555 5555");
	await page.locator("#message-input").fill("Automated test message");
}

test("email links copy the address and announce success", async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: {
				writeText(value) {
					window.copiedEmail = value;
					return Promise.resolve();
				}
			}
		});
	});
	await page.goto("/en/");
	const emailLink = page.locator("[data-copy-email]").first();

	await emailLink.click();
	await expect(emailLink.locator("xpath=following-sibling::*[@data-copy-status]")).not.toBeEmpty();
	await expect.poll(() => page.evaluate(() => window.copiedEmail)).toBe("mrmalvicino@gmail.com");
});

test("the three page templates render their critical controls", async ({ page }) => {
	await page.goto("/en/");
	await expect(page.locator("#menu-list > li")).toHaveCount(5);
	await expect(page.locator("#projects-list > .project-card").first()).toBeVisible();
	await expect(page.locator("[data-contact-form]")).toBeVisible();

	await page.goto("/en/projects/");
	await expect(page.locator("#project-filters")).toBeVisible();
	await expect(page.locator("#projects-list > .project-card").first()).toBeVisible();

	await page.goto("/en/cv/");
	await expect(page.locator("html")).toHaveAttribute("data-active-cv-profile", "1");
	await expect(page.locator("#skills-list > li:visible")).toHaveCount(2);
	await expect(page.locator("#skills-list > li:visible").last()).toContainText("Analytical thinking, Problem solving, Autonomy, Continuous learning, Teamwork");
	await expect(page.locator("#jobs-list > article:visible").first()).toBeVisible();

	await page.goto("/en/");
	await expect(page.getByRole("heading", { name: "Soft skills" })).toHaveCount(0);
});

test("the selected CV profile filters content and survives a language change", async ({ page }) => {
	await page.goto("/es/cv/?profile=2");

	await expect(page.locator("html")).toHaveAttribute("data-active-cv-profile", "2");
	await expect(page.locator("#job-search-label")).toBeVisible();
	await expect(page.locator("#projects-label")).toBeVisible();
	expect(await page.locator("#projects-list > article:visible").count()).toBeGreaterThan(0);
	await expect(page.locator("#skills-list > li:visible")).toHaveCount(2);
	await expect(page.locator("#skills-list > li:visible").last()).toContainText("Comunicación efectiva, Pensamiento analítico, Capacidad pedagógica, Creatividad, Organización y planificación");

	for (const selector of ["#skills-list > li:visible", "#jobs-list > article:visible", "#projects-list > article:visible", "#studies-list > article:visible"]) {
		const items = page.locator(selector);

		expect(await items.count()).toBeGreaterThan(0);
		expect(await items.evaluateAll(elements => (
			elements.every(element => element.dataset.cvProfiles.split(" ").includes("2"))
		))).toBe(true);
	}

	const englishLink = page.locator("#footer a[lang='en']");

	await expect(englishLink).toHaveAttribute("href", "/en/cv/?profile=2");
	await englishLink.click();
	await expect(page).toHaveURL(/\/en\/cv\/\?profile=2$/);
	await expect(page.locator("html")).toHaveAttribute("data-active-cv-profile", "2");
});

test("an invalid CV profile falls back to the default", async ({ page }) => {
	await page.goto("/en/cv/?profile=999");

	await expect(page.locator("html")).toHaveAttribute("data-active-cv-profile", "1");
	await expect(page.locator("#projects-label")).toBeVisible();
	await expect(page.locator("#projects-list > article:visible").first()).toBeVisible();
});

test("contact form submits successfully and clears its fields", async ({ page }) => {
	await page.route("https://formspree.io/**", route => route.fulfill({ body: "{}", contentType: "application/json", status: 200 }));
	await page.goto("/en/");
	await fillContactForm(page);
	await page.locator("#submit-btn").click();

	await expect(page.locator("[data-form-status]")).toHaveAttribute("data-state", "success");
	await expect(page.locator("#submit-btn")).toBeEnabled();
	await expect(page.locator("#name-input")).toHaveValue("");
	await expect(page.locator("#message-input")).toHaveValue("");
});

test("contact form preserves input after an HTTP error", async ({ page }) => {
	await page.route("https://formspree.io/**", route => route.fulfill({ body: "{}", status: 500 }));
	await page.goto("/en/");
	await fillContactForm(page);
	await page.locator("#submit-btn").click();

	await expect(page.locator("[data-form-status]")).toHaveAttribute("data-state", "error");
	await expect(page.locator("[data-form-status]")).toHaveAttribute("role", "alert");
	await expect(page.locator("#message-input")).toHaveValue("Automated test message");
});

test("project filters combine selections between groups", async ({ page }) => {
	await page.goto("/en/projects/");
	await page.locator('input[name="tech"][value="python"]').check();
	const pythonCount = await page.locator("#projects-list > .project-card:visible").count();

	expect(pythonCount).toBeGreaterThan(1);
	await page.locator('input[name="type"][value="research"]').check();
	const combinedCount = await page.locator("#projects-list > .project-card:visible").count();

	expect(combinedCount).toBeGreaterThan(0);
	expect(combinedCount).toBeLessThan(pythonCount);
	await expect(page).toHaveURL(/tech=python&type=research/);
});

test("project filters restore valid URL state and browser history", async ({ page }) => {
	await page.goto("/en/projects/?tech=unknown,html&type=static-site");

	await expect(page.locator('input[name="tech"][value="html"]')).toBeChecked();
	await expect(page).toHaveURL(/\?tech=html&type=static-site$/);
	const initialCount = await page.locator("#projects-list > .project-card:visible").count();

	await page.locator('input[name="contribution"][value="freelance-one-off"]').check();
	expect(await page.locator("#projects-list > .project-card:visible").count()).toBeLessThan(initialCount);
	await page.goBack();
	await expect(page.locator('input[name="contribution"][value="freelance-one-off"]')).not.toBeChecked();
});

test("project filters expose and clear an empty state", async ({ page }) => {
	await page.goto("/en/projects/");
	await page.locator('input[name="tech"][value="dotnet"]').check();
	await page.locator('input[name="type"][value="notes"]').check();
	await page.locator('input[name="contribution"][value="employment"]').check();

	await expect(page.locator("#projects-list > .project-card:visible")).toHaveCount(0);
	await expect(page.locator("#project-empty-state")).toBeVisible();
	await page.locator("#project-empty-state [data-clear-filters]").click();
	await expect(page.locator("#projects-list > .project-card:visible").first()).toBeVisible();
	await expect(page).toHaveURL(/\/en\/projects\/$/);
});

test("root and legacy routes redirect to localized canonical pages", async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, "languages", { get: () => ["en-US"] });
	});
	await page.goto("/");
	await expect(page).toHaveURL(/\/en\/$/);

	await page.goto("/cv.html?lang=es");
	await expect(page).toHaveURL(/\/es\/cv\/$/);
});

test("mobile menu manages state, focus, and scroll locking", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 800 });
	await page.goto("/en/");
	const toggle = page.locator("#toggle-btn");

	await toggle.click();
	await expect(toggle).toHaveAttribute("aria-expanded", "true");
	await expect(page.locator("#menu-list a").first()).toBeFocused();
	await expect(page.locator("body")).toHaveClass(/no-scroll/);

	await page.keyboard.press("Escape");
	await expect(toggle).toHaveAttribute("aria-expanded", "false");
	await expect(toggle).toBeFocused();
	await expect(page.locator("body")).not.toHaveClass(/no-scroll/);
});

test("all page templates fit a narrow viewport", async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 900 });

	for (const route of ["/es/", "/es/projects/", "/es/cv/?profile=2"]) {
		await page.goto(route);
		expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
			.toBeLessThanOrEqual(1);
	}
});

test.describe("without JavaScript", () => {
	test.use({ javaScriptEnabled: false });

	test("static content and fallbacks remain available", async ({ page }) => {
		await page.goto("/en/");
		await expect(page.locator("h1")).not.toBeEmpty();
		await expect(page.locator("[data-contact-form]")).toHaveAttribute("method", "POST");
		await expect(page.locator("[data-copy-email]").first()).toHaveAttribute("href", /^mailto:/);

		await page.goto("/en/projects/");
		await expect(page.locator("#project-filters")).toBeHidden();
		await expect(page.locator("#projects-list > .project-card").first()).toBeVisible();

		await page.goto("/en/cv/");
		await expect(page.locator("#jobs-list > article").first()).toBeVisible();
		await expect(page.locator("#projects-list > article").first()).toBeVisible();
	});
});
