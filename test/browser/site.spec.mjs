import { expect, openRenderedPage, test } from "./portfolio-test.mjs";

const languages = {
	es: {
		indexTitle: "Habilidades",
		projectsTitle: "Todos mis proyectos",
		filtersTitle: "Filtrar proyectos",
		resultCount: "23 proyectos",
		cvTitle: "< Habilidades />",
		resume: "malvicino-es.pdf"
	},
	en: {
		indexTitle: "Skills",
		projectsTitle: "All My Projects",
		filtersTitle: "Filter projects",
		resultCount: "23 projects",
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
			await expect(page.locator("#skillGroupsDiv > .skill-category")).toHaveCount(4);
			await expect(page.locator("#skillGroupsDiv .skill-subcategory")).toHaveCount(11);
			await expect(page.locator("#skillGroupsDiv .skill-technology")).toHaveCount(19);
			await expect(page.locator("#skillGroupsDiv .skill-technology-icon")).toHaveCount(19);
			await expect(page.locator("#studiesTab > tr")).toHaveCount(9);
			await expect(page.locator("#studiesTab > tr").nth(1).locator(".bi-mortarboard")).toHaveCount(1);
			await expect(page.locator("#studiesTab > tr").nth(1).locator(".bi-award")).toHaveCount(1);
			await expect(page.locator("#footer")).toContainText("General Pacheco, Buenos Aires, Argentina");
			const locationLines = await page.locator("#footer .footer-location span:last-child").evaluate(element => {
				const range = document.createRange();

				range.selectNodeContents(element);

				return range.getClientRects().length;
			});

			expect(locationLines).toBeLessThanOrEqual(2);
			const socialAlignment = await page.locator("#footer ul").evaluate(element => {
				const footerBounds = document.querySelector("#footer").getBoundingClientRect();
				const socialBounds = element.getBoundingClientRect();

				return Math.abs(
					socialBounds.left + socialBounds.width / 2 - (footerBounds.left + footerBounds.width / 2)
				);
			});

			expect(socialAlignment).toBeLessThanOrEqual(1);
			await expect(page.locator("#projectsDiv .project-bot-div h3")).toHaveText(featuredProjects);
			await expect(page.locator("#resumeBtn")).toHaveAttribute("download", labels.resume);
			await expect(page.locator(`a[lang='es'][href='/es/']`)).toBeVisible();
			await expect(page.locator(`a[lang='en'][href='/en/']`)).toBeVisible();
		});

		test("project catalog contains every project and media variant", async ({ page }) => {
			await openRenderedPage(page, `/${language}/projects/`, "#projectsDiv > .project-card", 23);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#projectsLbl")).toHaveText(labels.projectsTitle);
			await expect(page.locator("#filtersLbl")).toHaveText(labels.filtersTitle);
			await expect(page.locator("#projectResultCount")).toHaveText(labels.resultCount);
			await expect(page.locator('input[name="tech"]')).toHaveCount(17);
			await expect(page.locator('input[name="type"]')).toHaveCount(5);
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
			await expect(page.locator("#skillsLst > li")).toHaveCount(4);
			await expect(page.locator("#careersLst > li")).toHaveCount(2);
			await expect(page.locator("#coursesLst > li")).toHaveCount(3);
			await expect(page.locator("#languagesLst > li")).toHaveCount(3);
			await expect(page.locator("#projectsLst > li > h4")).toHaveText(featuredProjects);
			await expect(page.locator("#jobsLst > li")).toHaveCount(4);
			await expect(page.locator("#jobsLst > li").first()).toContainText("Halley Accurate Solutions");

			const experienceLayout = await page.locator("#rightColumnSec").evaluate(column => ({
				contentBottom: column.querySelector("#jobsLst > li:last-child").getBoundingClientRect().bottom,
				columnBottom: column.getBoundingClientRect().bottom
			}));

			expect(experienceLayout.contentBottom).toBeLessThanOrEqual(experienceLayout.columnBottom);
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

test.describe("project filters", () => {
	test("combine OR selections within categories and AND between categories", async ({ page }) => {
		await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 23);

		await page.locator('input[name="tech"][value="python"]').check();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(4);
		await expect(page).toHaveURL(/\?tech=python$/);

		await page.locator('input[name="tech"][value="cpp"]').check();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(9);
		await expect(page).toHaveURL(/\?tech=cpp%2Cpython$|\?tech=python%2Ccpp$/);

		await page.locator('input[name="type"][value="desktop-app"]').check();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(7);

		await page.locator('input[name="type"][value="research"]').check();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(8);
		await expect(page.locator("#projectResultCount")).toHaveText("8 projects");
	});

	test("restore filters from a shared URL and browser history", async ({ page }) => {
		await openRenderedPage(
			page,
			"/es/projects/?tech=python,cpp&type=desktop-app,research",
			"#projectsDiv > .project-card",
			23
		);

		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(8);
		await expect(page.locator('input[name="tech"][value="python"]')).toBeChecked();
		await expect(page.locator('input[name="type"][value="research"]')).toBeChecked();

		await page.locator('input[name="type"][value="research"]').uncheck();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(7);
		await page.goBack();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(8);
		await expect(page.locator('input[name="type"][value="research"]')).toBeChecked();

		await page.goForward();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(7);
		await expect(page.locator('input[name="type"][value="research"]')).not.toBeChecked();
	});

	test("show an empty state and clear all filters", async ({ page }) => {
		await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 23);

		await page.locator('input[name="tech"][value="dotnet"]').check();
		await page.locator('input[name="type"][value="notes"]').check();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(0);
		await expect(page.locator("#projectEmptyState")).toBeVisible();
		await expect(page.locator("#projectResultCount")).toHaveText("0 projects");

		await page.locator("#projectEmptyState [data-clear-filters]").click();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(23);
		await expect(page.locator("#projectEmptyState")).toBeHidden();
		await expect(page).toHaveURL(/\/en\/projects\/$/);
	});

	test("filters can be operated with the keyboard", async ({ page }) => {
		await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 23);
		const pythonFilter = page.locator('input[name="tech"][value="python"]');

		await pythonFilter.focus();
		await page.keyboard.press("Space");

		await expect(pythonFilter).toBeChecked();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(4);
	});
});

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
	await page.setViewportSize({ width: 320, height: 800 });
	await openRenderedPage(page, "/es/", "#menuLst > li", 5);
	const location = page.locator("#footer .footer-location span:last-child");
	const locationLines = await location.evaluate(element => {
		const range = document.createRange();

		range.selectNodeContents(element);

		return range.getClientRects().length;
	});

	await page.locator("#toggleBtn").click();
	await expect(page.locator("#menuNav")).toHaveClass(/nav-toggle/);
	await expect(page.locator("body")).toHaveClass(/no-scroll/);
	expect(locationLines).toBeLessThanOrEqual(2);

	await page.locator("#menuLst > li").first().click();
	await expect(page.locator("#menuNav")).not.toHaveClass(/nav-toggle/);
	await expect(page.locator("body")).not.toHaveClass(/no-scroll/);
});

test("project cards preserve icon contrast and fit narrow screens", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 800 });
	await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 23);

	const firstCard = page.locator("#projectsDiv > .project-card").first();
	const technologies = firstCard.locator(".project-technology");
	const technologyIcons = technologies.locator(".project-technology-icon");

	await expect(technologies).toHaveCount(7);
	await expect(technologyIcons).toHaveCount(7);
	await expect(technologies.first()).toHaveCSS("background-color", "rgb(250, 250, 250)");
	await expect(technologyIcons.first()).toHaveCSS("width", "30px");
	await expect(technologyIcons.first()).toHaveAttribute("alt", /.+/);

	const layout = await firstCard.evaluate(card => {
		const technologyRows = new Set(
			[...card.querySelectorAll(".project-technology")].map(item => item.getBoundingClientRect().top)
		);

		return {
			cardFits: card.scrollWidth <= card.clientWidth,
			pageFits: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
			technologyRows: technologyRows.size
		};
	});

	expect(layout.cardFits).toBe(true);
	expect(layout.pageFits).toBe(true);
	expect(layout.technologyRows).toBeGreaterThan(1);
});

test("skill groups use two responsive columns without horizontal overflow", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await openRenderedPage(page, "/en/", "#skillGroupsDiv > .skill-category", 4);

	const desktopLayout = await page.locator("#skillGroupsDiv").evaluate(container => ({
		cards: [...container.children].map(card => ({
			height: card.getBoundingClientRect().height,
			top: card.getBoundingClientRect().top
		})),
		columns: getComputedStyle(container).gridTemplateColumns.split(" ").length,
		pageFits: document.documentElement.scrollWidth <= document.documentElement.clientWidth
	}));

	expect(desktopLayout.columns).toBe(2);
	expect(desktopLayout.cards[0].top).toBe(desktopLayout.cards[1].top);
	expect(desktopLayout.cards[0].height).toBe(desktopLayout.cards[1].height);
	expect(desktopLayout.pageFits).toBe(true);

	await page.setViewportSize({ width: 390, height: 844 });

	const mobileLayout = await page.locator("#skillGroupsDiv").evaluate(container => ({
		columns: getComputedStyle(container).gridTemplateColumns.split(" ").length,
		pageFits: document.documentElement.scrollWidth <= document.documentElement.clientWidth
	}));

	expect(mobileLayout.columns).toBe(1);
	expect(mobileLayout.pageFits).toBe(true);
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
		await expect(page.locator("#projectFilters")).toBeHidden();
	});
});
