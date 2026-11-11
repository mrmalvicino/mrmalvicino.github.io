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
		test("portfolio renders its localized content and entity relationships", async ({ page }) => {
			await openRenderedPage(page, `/index.html?lang=${language}`, "#projectsDiv > .project-card", 3);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#skillsLbl")).toHaveText(labels.indexTitle);
			await expect(page.locator("#menuLst > li")).toHaveCount(5);
			await expect(page.locator("#bannerDiv > .banner-slide")).toHaveCount(2);
			await expect(page.locator("#bannerDiv > .banner-slide img")).toHaveCount(12);
			await expect(page.locator("#stacksDiv > .stack-card")).toHaveCount(3);
			await expect(page.locator("#studiesTab > tr")).toHaveCount(9);
			await expect(page.locator("#projectsDiv .project-bot-div h3")).toHaveText(featuredProjects);
			await expect(page.locator("#resumeBtn")).toHaveAttribute("download", labels.resume);
			await expect(page.locator("#footer a[href='?lang=es']")).toBeVisible();
			await expect(page.locator("#footer a[href='?lang=en']")).toBeVisible();
		});

		test("project catalog renders every project and media variant", async ({ page }) => {
			await openRenderedPage(page, `/projects.html?lang=${language}`, "#projectsDiv > .project-card", 23);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#projectsLbl")).toHaveText(labels.projectsTitle);
			await expect(page.locator(".project-card .project-top-div > iframe")).toHaveCount(3);
			await expect(page.locator(".project-card .project-top-div > img:not([data-id='wipImg'])")).toHaveCount(16);
			await expect(page.locator(".project-card .project-top-div > img[data-id='wipImg']")).toHaveCount(4);
			await expect(page.locator(".project-card a:has([data-id='sourceCodeLbl'])")).toHaveCount(23);
			await expect(page.locator(".project-card a:has([data-id='openOnlineLbl'])")).toHaveCount(2);
		});

		test("resume renders the selected professional content", async ({ page }) => {
			await openRenderedPage(page, `/cv.html?lang=${language}`, "#projectsLst > li", 3);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#skillsLbl")).toHaveText(labels.cvTitle);
			await expect(page.locator("#skillsLst > li")).toHaveCount(3);
			await expect(page.locator("#careersLst > li")).toHaveCount(2);
			await expect(page.locator("#coursesLst > li")).toHaveCount(3);
			await expect(page.locator("#languagesLst > li")).toHaveCount(3);
			await expect(page.locator("#projectsLst > li > h4")).toHaveText(featuredProjects);
			await expect(page.locator("#jobsLst > li")).toHaveCount(3);
		});

		test("navigation preserves the selected language", async ({ page }) => {
			await openRenderedPage(page, `/index.html?lang=${language}`, "#projectsDiv > .project-card", 3);
			await page.locator("#allProjectsLbl").click();
			await expect(page).toHaveURL(new RegExp(`/projects\\.html\\?lang=${language}$`));
			await expect(page.locator("#projectsDiv > .project-card")).toHaveCount(23);

			await page.locator("#backLbl").click();
			await expect(page).toHaveURL(new RegExp(`/index\\.html\\?lang=${language}$`));
			await expect(page.locator("#projectsDiv > .project-card")).toHaveCount(3);
		});
	});
}

test("language control changes the localized content", async ({ page }) => {
	await openRenderedPage(page, "/index.html?lang=es", "#projectsDiv > .project-card", 3);
	await page.locator("#footer a[href='?lang=en']").click();

	await expect(page).toHaveURL(/\/index\.html\?lang=en$/);
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
	await expect(page.locator("#skillsLbl")).toHaveText("Skills");
});

test("mobile menu opens and closes without leaving the page blocked", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await openRenderedPage(page, "/index.html?lang=es", "#menuLst > li", 5);

	await page.locator("#toggleBtn").click();
	await expect(page.locator("#menuNav")).toHaveClass(/nav-toggle/);
	await expect(page.locator("body")).toHaveClass(/no-scroll/);

	await page.locator("#menuLst > li").first().click();
	await expect(page.locator("#menuNav")).not.toHaveClass(/nav-toggle/);
	await expect(page.locator("body")).not.toHaveClass(/no-scroll/);
});
