import { expect, openRenderedPage, test } from "./portfolio-test.mjs";

const languages = {
	es: {
		jobSearch: "Estoy en búsqueda activa de oportunidades como desarrollador .NET.",
		indexTitle: "Habilidades",
		projectsTitle: "Todos mis proyectos",
		filtersTitle: "Filtros",
		contributionsTitle: "Contribución",
		resultCount: "25 proyectos",
		cvTitle: "Habilidades técnicas",
		cvProfileTitle: "Perfil profesional",
		cvExperienceTitle: "Experiencia laboral",
		cvFreelanceTitle: "Experiencia freelance",
		cvCoursePrefix: "Curso",
		cvPosition: "Desarrollador de Software .NET",
		resume: "malvicino-es.pdf",
		resumeLabel: "Descargar CV",
		onlineResume: "Ver CV online",
		website: "Sitio web"
	},
	en: {
		jobSearch: "I am actively seeking opportunities as a .NET developer.",
		indexTitle: "Skills",
		projectsTitle: "All My Projects",
		filtersTitle: "Filters",
		contributionsTitle: "Contribution",
		resultCount: "25 projects",
		cvTitle: "Technical Skills",
		cvProfileTitle: "Professional Profile",
		cvExperienceTitle: "Work Experience",
		cvFreelanceTitle: "Freelance Experience",
		cvCoursePrefix: "Course",
		cvPosition: ".NET Software Developer",
		resume: "malvicino-en.pdf",
		resumeLabel: "Download CV",
		onlineResume: "View CV online",
		website: "Website"
	}
};

const featuredProjects = ["Membriana", "deCauciones", "Halley V2"];
const freelanceProjects = ["Membriana", "deCauciones"];

for (const [language, labels] of Object.entries(languages)) {
	test.describe(`${language.toUpperCase()} content`, () => {
		test("portfolio contains localized entities in its initial HTML", async ({ page }) => {
			await openRenderedPage(page, `/${language}/`, "#projectsDiv > .project-card", 3);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#skillsLbl")).toHaveText(labels.indexTitle);
			await expect(page.locator("#jobSearchLbl")).toHaveText(labels.jobSearch);
			await expect(page.locator("#menuLst > li")).toHaveCount(5);
			await expect(page.locator("#skillGroupsDiv > .skill-category")).toHaveCount(4);
			await expect(page.locator("#skillGroupsDiv .skill-subcategory")).toHaveCount(11);
			await expect(page.locator("#skillGroupsDiv .skill-technology")).toHaveCount(19);
			await expect(page.locator("#skillGroupsDiv .skill-technology-icon")).toHaveCount(19);
			await expect(page.locator("#studiesTab > tr")).toHaveCount(9);
			await expect(page.locator("#studiesTab > tr").nth(1).locator(".bi-mortarboard")).toHaveCount(1);
			await expect(page.locator("#studiesTab > tr").nth(1).locator(".bi-award")).toHaveCount(1);
			await expect(page.locator("#footer")).toContainText("General Pacheco, Buenos Aires, Argentina");
			await expect(page.locator("#footer .footer-pages > a")).toHaveCount(3);
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
			await expect(page.locator("#projectsDiv .project-details h3")).toHaveText(featuredProjects);
			await expect(page.locator("#projectsDiv .project-actions a").first()).toHaveAttribute("target", "_blank");
			await expect(page.locator("#projectsDiv .project-actions a").first()).toHaveAttribute("rel", "noopener noreferrer");
			await expect(page.locator("#resumeBtn")).toHaveAttribute("download", labels.resume);
			await expect(page.locator("#resumeBtn")).toHaveText(labels.resumeLabel);
			await expect(page.locator("#onlineResumeBtn")).toHaveText(labels.onlineResume);
			await expect(page.locator("#onlineResumeBtn")).toHaveAttribute("href", `/${language}/cv/`);
			await expect(page.locator("#onlineResumeBtn")).not.toHaveAttribute("target", "_blank");
			await expect(page.locator("#onlineResumeBtn")).toHaveCSS("text-decoration-line", "underline");
			await expect(page.locator(`a[lang='es'][href='/es/']`)).toBeVisible();
			await expect(page.locator(`a[lang='en'][href='/en/']`)).toBeVisible();
		});

		test("project catalog contains every project and media variant", async ({ page }) => {
			await openRenderedPage(page, `/${language}/projects/`, "#projectsDiv > .project-card", 25);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#projectsLbl")).toHaveText(labels.projectsTitle);
			await expect(page.locator("#filtersLbl")).toHaveText(labels.filtersTitle);
			await expect(page.locator("#projectResultCount")).toHaveText(labels.resultCount);
			await expect(page.locator(".menu-header #backLbl")).toHaveCount(1);
			await expect(page.locator(".menu-header #menuLst")).toHaveCount(0);
			await expect(page.locator("#footer")).toBeVisible();
			await expect(page.locator('input[name="tech"]')).toHaveCount(20);
			await expect(page.locator('input[name="type"]')).toHaveCount(5);
			await expect(page.locator('[data-filter-group="contribution"] legend')).toHaveText(labels.contributionsTitle);
			await expect(page.locator('input[name="contribution"]')).toHaveCount(5);
			await expect(page.locator(".project-card .project-top-div > iframe")).toHaveCount(3);
			await expect(page.locator(".project-card .project-top-div > img:not([alt*='Progress']):not([alt*='proceso'])")).toHaveCount(18);
			await expect(page.locator(".project-card .project-top-div > img[title='WIP']")).toHaveCount(4);
			await expect(page.locator(".project-card a:has(.bi-code-slash)")).toHaveCount(23);
			await expect(page.locator(".project-card a:has(.bi-eye)")).toHaveCount(3);
			await expect(page.locator(".project-card a:has(.bi-globe2)")).toHaveCount(1);
			await expect(page.locator('[data-project-id="decauciones"]')).toHaveAttribute("data-participation-mode", "freelance-one-off");
			await expect(page.locator('[data-project-id="decauciones"] .project-top-div > img')).toHaveAttribute("src", "/assets/images/projects/decauciones.webp");
			await expect(page.locator('[data-project-id="halley-v2"] .project-top-div > img')).toHaveAttribute("src", "/assets/images/projects/halley-v2.webp");
			await expect(page.locator('[data-project-id="halley-v2"] a:has(.bi-code-slash)')).toHaveCount(0);
			await expect(page.locator('[data-project-id="halley-v2"] a:has(.bi-eye)')).toHaveCount(0);
			await expect(page.locator('[data-project-id="halley-v2"] a:has(.bi-globe2)')).toHaveText(labels.website);
		});

		test("resume contains semantic ATS content in logical order", async ({ page }) => {
			await openRenderedPage(page, `/${language}/cv/`, "#projectsLst > article", 2);

			await expect(page.locator("html")).toHaveAttribute("lang", language);
			await expect(page.locator("#profileLbl")).toHaveText(labels.cvProfileTitle);
			await expect(page.locator("#experienceLbl")).toHaveText(labels.cvExperienceTitle);
			await expect(page.locator("#projectsLbl")).toHaveText(labels.cvFreelanceTitle);
			await expect(page.locator("#educationLbl")).toBeVisible();
			await expect(page.locator("#skillsLbl")).toHaveText(labels.cvTitle);
			await expect(page.locator(".cv-heading > p")).toHaveText(labels.cvPosition);
			await expect(page.locator("#jobSearchLbl")).toHaveText(labels.jobSearch);
			await expect(page.locator(".cv-contact-row")).toHaveCount(1);
			await expect(page.locator(".cv-contact-row > a")).toHaveCount(5);
			await expect(page.locator(".cv-contact-row")).toContainText("General Pacheco, Buenos Aires");
			await expect(page.locator(".menu-header #backLbl")).toHaveCount(1);
			await expect(page.locator(".menu-header #menuLst")).toHaveCount(0);
			await expect(page.locator("#footer")).toBeVisible();
			await expect(page.locator("#footer a[lang='es']")).toHaveAttribute("href", "/es/cv/");
			await expect(page.locator("#footer a[lang='en']")).toHaveAttribute("href", "/en/cv/");
			await expect(page.locator("#skillsLst > li")).toHaveCount(6);
			await expect(page.locator("#skillsLst")).not.toContainText("Uso profesional frecuente");
			await expect(page.locator("#skillsLst")).not.toContainText("Frequent professional use");
			await expect(page.locator("#skillsLst")).not.toContainText("Complementary professional use");
			await expect(page.locator("#studiesLst > article")).toHaveCount(8);
			await expect(page.locator("#studiesLst")).toContainText(labels.cvCoursePrefix);
			await expect(page.locator("#careersLbl, #coursesLbl, #languagesLbl")).toHaveCount(0);
			await expect(page.locator("#projectsLst > article > h3")).toHaveText(freelanceProjects);
			await expect(page.locator("#projectsLst > article").first().locator("a"))
				.toHaveAttribute("href", "https://github.com/mrmalvicino/membriana");
			await expect(page.locator("#projectsLst > article").nth(1).locator("a"))
				.toHaveAttribute("href", "https://decauciones.com");
			await expect(page.locator("#jobsLst > article")).toHaveCount(4);
			await expect(page.locator("#jobsLst > article").first()).toContainText("Halley Accurate Solutions");
			await expect(page.locator("#jobsLst time")).toHaveCount(8);

			const sectionIds = await page.locator(".cv-main > section > h2").evaluateAll(headings => (
				headings.map(heading => heading.id)
			));

			expect(sectionIds).toEqual(["profileLbl", "skillsLbl", "experienceLbl", "projectsLbl", "educationLbl"]);
		});

		test("navigation stays in the selected language", async ({ page }) => {
			await openRenderedPage(page, `/${language}/`, "#projectsDiv > .project-card", 3);
			await page.locator("#allProjectsLbl").click();
			await expect(page).toHaveURL(new RegExp(`/${language}/projects/$`));
			await expect(page.locator("#projectsDiv > .project-card")).toHaveCount(25);

			await page.locator("#backLbl").click();
			await expect(page).toHaveURL(new RegExp(`/${language}/$`));
			await expect(page.locator("#projectsDiv > .project-card")).toHaveCount(3);
		});
	});
}

test.describe("project filters", () => {
	test("combine OR selections within categories and AND between categories", async ({ page }) => {
		await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 25);

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

	test("filter every contribution mode and combine contribution selections with OR", async ({ page }) => {
		await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 25);
		const expectedResults = {
			"freelance-saas": { count: 2, titles: ["Membriana", "Meeni ERP"] },
			"freelance-one-off": { count: 1, title: "deCauciones" },
			employment: { count: 1, title: "Halley V2" },
			"independent-collaboration": { count: 7 },
			"independent-development": { count: 14 }
		};

		for (const [mode, expected] of Object.entries(expectedResults)) {
			const checkbox = page.locator(`input[name="contribution"][value="${mode}"]`);

			await checkbox.check();
			await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(expected.count);

			if (expected.title) {
				await expect(page.locator("#projectsDiv > .project-card:visible h3")).toHaveText(expected.title);
			}

			if (expected.titles) {
				await expect(page.locator("#projectsDiv > .project-card:visible h3")).toHaveText(expected.titles);
			}

			await checkbox.uncheck();
		}

		await page.locator('input[name="contribution"][value="freelance-saas"]').check();
		await page.locator('input[name="contribution"][value="freelance-one-off"]').check();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(3);
		await expect(page.locator("#projectsDiv > .project-card:visible h3")).toHaveText([
			"Membriana",
			"deCauciones",
			"Meeni ERP"
		]);
	});

	test("combine technology, project type, and contribution filters with AND", async ({ page }) => {
		await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 25);

		await page.locator('input[name="tech"][value="javascript"]').check();
		await page.locator('input[name="type"][value="static-site"]').check();
		await page.locator('input[name="contribution"][value="freelance-one-off"]').check();

		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(1);
		await expect(page.locator("#projectsDiv > .project-card:visible h3")).toHaveText("deCauciones");
		await expect(page).toHaveURL(/tech=javascript&type=static-site&contribution=freelance-one-off$/);
	});

	test("restore filters from a shared URL and browser history", async ({ page }) => {
		await openRenderedPage(
			page,
			"/es/projects/?tech=html,javascript&type=static-site&contribution=freelance-one-off,independent-development",
			"#projectsDiv > .project-card",
			25
		);

		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(3);
		await expect(page.locator('input[name="tech"][value="html"]')).toBeChecked();
		await expect(page.locator('input[name="type"][value="static-site"]')).toBeChecked();
		await expect(page.locator('input[name="contribution"][value="freelance-one-off"]')).toBeChecked();

		await page.locator('input[name="contribution"][value="independent-development"]').uncheck();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(1);
		await page.goBack();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(3);
		await expect(page.locator('input[name="contribution"][value="independent-development"]')).toBeChecked();

		await page.goForward();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(1);
		await expect(page.locator('input[name="contribution"][value="independent-development"]')).not.toBeChecked();
	});

	test("ignore unknown contribution values without errors", async ({ page }) => {
		await openRenderedPage(
			page,
			"/en/projects/?contribution=unknown,employment",
			"#projectsDiv > .project-card",
			25
		);

		await expect(page.locator('input[name="contribution"][value="employment"]')).toBeChecked();
		await expect(page.locator("#projectsDiv > .project-card:visible h3")).toHaveText("Halley V2");
	});

	test("show an empty state and clear all filters", async ({ page }) => {
		await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 25);

		await page.locator('input[name="tech"][value="dotnet"]').check();
		await page.locator('input[name="type"][value="notes"]').check();
		await page.locator('input[name="contribution"][value="employment"]').check();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(0);
		await expect(page.locator("#projectEmptyState")).toBeVisible();
		await expect(page.locator("#projectResultCount")).toHaveText("0 projects");

		await page.locator("#projectEmptyState [data-clear-filters]").click();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(25);
		await expect(page.locator("#projectEmptyState")).toBeHidden();
		await expect(page).toHaveURL(/\/en\/projects\/$/);
	});

	test("filters can be operated with the keyboard", async ({ page }) => {
		await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 25);
		const employmentFilter = page.locator('input[name="contribution"][value="employment"]');

		await employmentFilter.focus();
		await page.keyboard.press("Space");

		await expect(employmentFilter).toBeChecked();
		await expect(page.locator("#projectsDiv > .project-card:visible")).toHaveCount(1);
	});
});

for (const pageData of [
	{ path: "", selector: "#skillsLbl", text: "Skills" },
	{ path: "projects/", selector: "#projectsLbl", text: "All My Projects" },
	{ path: "cv/", selector: "#skillsLbl", text: "Technical Skills" }
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

test("legacy language parameters preserve the selected language", async ({ page }) => {
	await page.goto("/?lang=en");
	await expect(page).toHaveURL(/\/en\/$/);

	await page.goto("/index.html?lang=es");
	await expect(page).toHaveURL(/\/es\/$/);

	await page.goto("/projects.html?lang=en");
	await expect(page).toHaveURL(/\/en\/projects\/$/);

	await page.goto("/cv.html?lang=es");
	await expect(page).toHaveURL(/\/es\/cv\/$/);
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

test("mobile menu uses the same 1000px boundary as CSS", async ({ page }) => {
	await page.setViewportSize({ width: 1000, height: 800 });
	await openRenderedPage(page, "/es/", "#menuLst > li", 5);

	await expect(page.locator("#toggleBtn")).toBeVisible();
	await page.locator("#toggleBtn").click();
	await expect(page.locator("#menuNav")).toHaveClass(/nav-toggle/);

	await page.setViewportSize({ width: 1001, height: 800 });
	await expect(page.locator("#menuNav")).not.toHaveClass(/nav-toggle/);
	await expect(page.locator("body")).not.toHaveClass(/no-scroll/);
});

for (const width of [375, 800, 1300]) {
	test(`localized pages fit the representative ${width}px viewport`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });

		for (const language of Object.keys(languages)) {
			for (const route of ["", "projects/", "cv/"]) {
				await page.goto(`/${language}/${route}`);
				await expect(page.locator("body")).toBeVisible();

				const horizontalOverflow = await page.evaluate(() => (
					document.documentElement.scrollWidth - document.documentElement.clientWidth
				));

				expect(horizontalOverflow).toBeLessThanOrEqual(1);
			}
		}
	});
}

test("project cards preserve icon contrast and fit narrow screens", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 800 });
	await openRenderedPage(page, "/en/projects/", "#projectsDiv > .project-card", 25);

	const firstCard = page.locator("#projectsDiv > .project-card").first();
	const technologies = firstCard.locator(".project-technology");
	const technologyIcons = technologies.locator(".project-technology-icon");

	await expect(technologies).toHaveCount(6);
	await expect(technologyIcons).toHaveCount(6);
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

test("resume fits mobile screens and produces an A4 print document", async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 800 });
	await openRenderedPage(page, "/en/cv/", "#jobsLst > article", 4);

	const screenLayout = await page.evaluate(() => ({
		pageFits: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
		mainColumns: getComputedStyle(document.querySelector(".cv-main")).gridTemplateColumns
	}));

	expect(screenLayout.pageFits).toBe(true);
	expect(screenLayout.mainColumns).toBe("none");

	const screenDocumentStyles = await page.evaluate(() => {
		const header = getComputedStyle(document.querySelector(".cv-header"));
		const heading = getComputedStyle(document.querySelector(".cv-section > h2"));
		const link = getComputedStyle(document.querySelector(".cv-contact a"));

		return {
			headerBackground: header.backgroundColor,
			headerColor: header.color,
			headerFont: header.fontFamily,
			headingColor: heading.color,
			headingFont: heading.fontFamily,
			headingTextAlign: heading.textAlign,
			linkDecoration: link.textDecorationLine
		};
	});

	await page.emulateMedia({ media: "print" });
	await expect(page.locator(".site-chrome")).toHaveCount(2);
	await expect(page.locator(".site-chrome").first()).toBeHidden();
	await expect(page.locator(".site-chrome").last()).toBeHidden();

	const printDocumentStyles = await page.evaluate(() => {
		const header = getComputedStyle(document.querySelector(".cv-header"));
		const heading = getComputedStyle(document.querySelector(".cv-section > h2"));
		const link = getComputedStyle(document.querySelector(".cv-contact a"));

		return {
			headerBackground: header.backgroundColor,
			headerColor: header.color,
			headerFont: header.fontFamily,
			headingColor: heading.color,
			headingFont: heading.fontFamily,
			headingTextAlign: heading.textAlign,
			linkDecoration: link.textDecorationLine
		};
	});

	expect(printDocumentStyles).toEqual(screenDocumentStyles);

	const pdf = await page.pdf({ format: "A4", printBackground: true });

	expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
	expect(pdf.byteLength).toBeGreaterThan(10000);
});

test("project and resume pages share identical navbar typography and colors", async ({ page }) => {
	const navbarStyles = async path => {
		await page.goto(path);

		return page.locator(".menu-header").evaluate(header => {
			const logo = getComputedStyle(header.querySelector("#logoBtn"));
			const backLink = getComputedStyle(header.querySelector("#backLbl"));

			return {
				backColor: backLink.color,
				backFontFamily: backLink.fontFamily,
				backFontSize: backLink.fontSize,
				logoColor: logo.color,
				logoFontFamily: logo.fontFamily,
				logoFontSize: logo.fontSize
			};
		});
	};
	const projectNavbar = await navbarStyles("/es/projects/");
	const resumeNavbar = await navbarStyles("/es/cv/");

	expect(resumeNavbar).toEqual(projectNavbar);
	expect(resumeNavbar.logoColor).toBe("rgb(255, 255, 255)");
	expect(resumeNavbar.backColor).toBe("rgb(204, 204, 204)");
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
		await expect(page.locator("#projectsDiv > .project-card")).toHaveCount(25);
		await expect(page.locator("#projectFilters")).toBeHidden();
	});

	test("resume content remains available", async ({ page }) => {
		await page.goto("/en/cv/");

		await expect(page.locator("h1")).toHaveText("Maximiliano Raúl Malvicino");
		await expect(page.locator("#jobsLst > article")).toHaveCount(4);
		await expect(page.locator("#projectsLst > article")).toHaveCount(2);
	});
});
