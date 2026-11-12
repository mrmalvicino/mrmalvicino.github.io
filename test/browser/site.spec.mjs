import { expect, openRenderedPage, test } from "./portfolio-test.mjs";

const languages = {
	es: {
		indexTitle: "Habilidades",
		projectsTitle: "Todos mis proyectos",
		cvTitle: "< Habilidades />",
		resume: "malvicino-es.pdf"
	},
	en: {
		indexTitle: "Skills",
		projectsTitle: "All My Projects",
		cvTitle: "< Skills />",
		resume: "malvicino-en.pdf"
	}
};

const featuredProjects = ["Meeni ERP", "Membriana", "Ecommerce Net"];

for (const [language, labels] of Object.entries(languages)) {
	test.describe(`${language.toUpperCase()} content`, () => {
		test("portfolio contains localized entities in its initial HTML", async ({ page }) => {
			await openRenderedPage(page, `/${language}/`, "#projectsDiv > .project-card", 3);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#skillsLbl")).toHaveText(labels.indexTitle);
			await expect(page.locator("#menuLst > li")).toHaveCount(5);
			await expect(page.locator("#bannerDiv > .banner-slide")).toHaveCount(2);
			await expect(page.locator("#bannerDiv > .banner-slide img")).toHaveCount(12);
			await expect(page.locator("#stacksDiv > .stack-card")).toHaveCount(3);
			await expect(page.locator("#studiesTab > tr")).toHaveCount(9);
			await expect(page.locator("#projectsDiv .project-bot-div h3")).toHaveText(featuredProjects);
			await expect(page.locator("#resumeBtn")).toHaveAttribute("download", labels.resume);
			await expect(page.locator(`a[lang='es'][href='/es/']`)).toBeVisible();
			await expect(page.locator(`a[lang='en'][href='/en/']`)).toBeVisible();
		});

		test("project catalog contains every project and media variant", async ({ page }) => {
			await openRenderedPage(page, `/${language}/projects/`, "#projectsDiv > .project-card", 23);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#projectsLbl")).toHaveText(labels.projectsTitle);
			await expect(page.locator(".project-card .project-top-div > iframe")).toHaveCount(3);
			await expect(page.locator(".project-card .project-top-div > img:not([alt*='Progress']):not([alt*='proceso'])")).toHaveCount(16);
			await expect(page.locator(".project-card .project-top-div > img[title='WIP']")).toHaveCount(4);
			await expect(page.locator(".project-card a:has(.bi-code-slash)")).toHaveCount(23);
			await expect(page.locator(".project-card a:has(.bi-eye)")).toHaveCount(2);
		});

		test("resume contains the selected professional content", async ({ page }) => {
			await openRenderedPage(page, `/${language}/cv/`, "#projectsLst > li", 3);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#skillsLbl")).toHaveText(labels.cvTitle);
			await expect(page.locator("#skillsLst > li")).toHaveCount(3);
			await expect(page.locator("#careersLst > li")).toHaveCount(2);
			await expect(page.locator("#coursesLst > li")).toHaveCount(3);
			await expect(page.locator("#languagesLst > li")).toHaveCount(3);
			await expect(page.locator("#projectsLst > li > h4")).toHaveText(featuredProjects);
			await expect(page.locator("#jobsLst > li")).toHaveCount(3);
		});

		test("navigation stays in the selected language", async ({ page }) => {
			await openRenderedPage(page, `/${language}/`, "#projectsDiv > .project-card", 3);
			await page.locator("#allProjectsLbl").click();
			await expect(page).toHaveURL(new RegExp(`/${language}/projects/$`));
			await expect(page.locator("#projectsDiv > .project-card")).toHaveCount(23);

			await page.locator("#backLbl").click();
			await expect(page).toHaveURL(new RegExp(`/${language}/$`));
			await expect(page.locator("#projectsDiv > .project-card")).toHaveCount(3);
		});
	});
}

for (const pageData of [
	{ path: "", selector: "#skillsLbl", text: "Skills" },
	{ path: "projects/", selector: "#projectsLbl", text: "All My Projects" },
	{ path: "cv/", selector: "#skillsLbl", text: "< Skills />" }
]) {
	test(`language link switches the equivalent ${pageData.path || "portfolio"} page`, async ({ page }) => {
		await page.goto(`/es/${pageData.path}`);
		await page.locator(`a[href='/en/${pageData.path}']`).click();

		await expect(page).toHaveURL(new RegExp(`/en/${pageData.path}$`));
		await expect(page.locator(pageData.selector)).toHaveText(pageData.text);
	});
}

test("root route detects the browser language", async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, "languages", { get: () => ["en-US"] });
	});
	await page.goto("/");

	await expect(page).toHaveURL(/\/en\/$/);
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("root route uses Spanish for a Spanish browser", async ({ page }) => {
	await page.goto("/");

	await expect(page).toHaveURL(/\/es\/$/);
	await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("root route uses English for any other browser language", async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, "languages", { get: () => ["pt-BR"] });
	});
	await page.goto("/");

	await expect(page).toHaveURL(/\/en\/$/);
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("mobile menu opens and closes without leaving the page blocked", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await openRenderedPage(page, "/es/", "#menuLst > li", 5);

	await page.locator("#toggleBtn").click();
	await expect(page.locator("#menuNav")).toHaveClass(/nav-toggle/);
	await expect(page.locator("body")).toHaveClass(/no-scroll/);

	await page.locator("#menuLst > li").first().click();
	await expect(page.locator("#menuNav")).not.toHaveClass(/nav-toggle/);
	await expect(page.locator("body")).not.toHaveClass(/no-scroll/);
});

test.describe("without JavaScript", () => {
	test.use({ javaScriptEnabled: false });

	test("content, navigation, and projects remain available", async ({ page }) => {
		await page.goto("/en/");

		await expect(page.locator("h1")).toContainText("Maximiliano");
		await expect(page.locator("#menuLst > li")).toHaveCount(5);
		await expect(page.locator("#projectsDiv > .project-card")).toHaveCount(3);
		await page.locator("#allProjectsLbl").click();
		await expect(page).toHaveURL(/\/en\/projects\/$/);
		await expect(page.locator("#projectsDiv > .project-card")).toHaveCount(23);
	});
});
