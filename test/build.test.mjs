import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { buildSite } from "../tools/build.mjs";
import { languages, outputFile, pages } from "../tools/site-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlRoutes = languages.flatMap(language => pages.map(page => outputFile(language.id, page.id)));
function getLocalStyles(contents) {
	return [...contents.matchAll(/href="\/style\/([^"]+)"/g)].map(match => match[1]);
}

async function listFiles(directory, prefix = "") {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const relativePath = path.join(prefix, entry.name);

		if (entry.isDirectory()) {
			files.push(...await listFiles(path.join(directory, entry.name), relativePath));
		} else {
			files.push(relativePath);
		}
	}

	return files;
}

async function assertLocalReferencesExist(output, route, contents) {
	for (const match of contents.matchAll(/(?:href|src|action)="([^"]+)"/g)) {
		const reference = match[1].replaceAll("&amp;", "&");

		if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(reference)) {
			continue;
		}

		const url = new URL(reference, `https://local.invalid/${route}`);
		let target = path.join(output, decodeURIComponent(url.pathname));

		if (url.pathname.endsWith("/")) {
			target = path.join(target, "index.html");
		}

		await stat(target);
	}
}

async function extractPdfText(filePath) {
	const document = await getDocument({ data: new Uint8Array(await readFile(filePath)) }).promise;
	const text = [];

	try {
		for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
			const page = await document.getPage(pageNumber);
			const content = await page.getTextContent();

			text.push(content.items.map(item => item.str).join(""));
		}
	} finally {
		await document.destroy();
	}

	return text.join(" ").replace(/\s+/g, " ").trim();
}

test("build creates localized HTML without runtime content data", async () => {
	const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "portfolio-build-"));
	const output = path.join(temporaryRoot, "dist");

	try {
		await buildSite(root, output);

		await Promise.all([
			...htmlRoutes.map(file => stat(path.join(output, file))),
			stat(path.join(output, "CNAME")),
			stat(path.join(output, "robots.txt")),
			stat(path.join(output, "sitemap.xml")),
			stat(path.join(output, "projects.html")),
			stat(path.join(output, "cv.html")),
			stat(path.join(output, "script/menu.js")),
			stat(path.join(output, "script/email-copy.js")),
			stat(path.join(output, "script/project-filters.js")),
			stat(path.join(output, "assets/images/branding/logo.webp")),
			stat(path.join(output, "assets/images/social/open-graph-image.png")),
			stat(path.join(output, "assets/images/profile.webp")),
			stat(path.join(output, "assets/images/projects/biblio-api.webp")),
			stat(path.join(output, "assets/images/projects/decauciones.webp")),
			stat(path.join(output, "assets/images/projects/halley-v2.webp")),
			stat(path.join(output, "assets/images/technologies/angular.webp")),
			stat(path.join(output, "assets/images/technologies/razor.svg")),
			stat(path.join(output, "assets/images/technologies/react.svg")),
			stat(path.join(output, "assets/fonts/jost-latin-300-normal.woff2")),
			stat(path.join(output, "assets/fonts/open-sans-latin-wght-normal.woff2")),
			stat(path.join(output, "assets/fonts/bootstrap-icons.woff2")),
			stat(path.join(output, "assets/licenses/jost.txt")),
			stat(path.join(output, "assets/licenses/open-sans.txt")),
			stat(path.join(output, "assets/licenses/bootstrap-icons.txt")),
			stat(path.join(output, "style/bundles/index.css")),
			stat(path.join(output, "style/bundles/projects.css")),
			stat(path.join(output, "style/bundles/cv.css")),
			stat(path.join(output, "assets/cv/malvicino-es.pdf")),
			stat(path.join(output, "assets/cv/malvicino-en.pdf"))
		]);

		const spanishPdf = await readFile(path.join(output, "assets/cv/malvicino-es.pdf"));
		const englishPdf = await readFile(path.join(output, "assets/cv/malvicino-en.pdf"));

		assert.equal(spanishPdf.subarray(0, 5).toString(), "%PDF-");
		assert.equal(englishPdf.subarray(0, 5).toString(), "%PDF-");
		assert.ok(spanishPdf.byteLength > 10000);
		assert.ok(englishPdf.byteLength > 10000);

		const html = new Map(await Promise.all(htmlRoutes.map(async route => [
			route,
			await readFile(path.join(output, route), "utf8")
		])));
		const rootHtml = await readFile(path.join(output, "index.html"), "utf8");
		const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");
		const robots = await readFile(path.join(output, "robots.txt"), "utf8");
		const legacyProjects = await readFile(path.join(output, "projects.html"), "utf8");
		const styleBundles = Object.fromEntries(languages.flatMap(language => pages.map(page => [
			outputFile(language.id, page.id),
			`bundles/${page.id}.css`
		])));

		for (const [route, bundle] of Object.entries(styleBundles)) {
			assert.deepEqual(getLocalStyles(html.get(route)), [bundle]);
		}

		assert.match(html.get("es/index.html"), /<html lang="es">/);
		assert.match(html.get("en/index.html"), /<html lang="en">/);
		assert.match(html.get("es/index.html"), /<title>Maximiliano Malvicino \| Desarrollador de Software \.NET<\/title>/);
		assert.match(html.get("en/projects/index.html"), /<title>Software Projects \| Maximiliano Malvicino<\/title>/);
		assert.match(html.get("es/cv/index.html"), /<meta name="description" content="Currículum de Maximiliano Malvicino/);
		assert.match(html.get("es/index.html"), /<link rel="canonical" href="https:\/\/mrmalvicino\.com\/es\/">/);
		assert.match(html.get("en/projects/index.html"), /hreflang="es" href="https:\/\/mrmalvicino\.com\/es\/projects\/"/);
		assert.match(html.get("en/projects/index.html"), /hreflang="x-default" href="https:\/\/mrmalvicino\.com\/"/);
		assert.match(html.get("en/index.html"), /<meta property="og:title" content="Maximiliano Malvicino \| \.NET Software Developer">/);
		assert.match(html.get("es/index.html"), /<meta name="twitter:card" content="summary_large_image">/);
		assert.match(html.get("es/index.html"), /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org"/);
		assert.match(html.get("es/index.html"), /"@type":"Person"/);
		assert.match(html.get("es/index.html"), /Desarrollador de Software \.NET/);
		assert.match(html.get("en/index.html"), />\.NET Software Developer</);
		assert.match(html.get("es/index.html"), /id="online-resume-btn" href="\/es\/cv\/"[\s\S]*Ver CV online/);
		assert.match(html.get("en/index.html"), /id="online-resume-btn" href="\/en\/cv\/"[\s\S]*View CV online/);
		assert.match(html.get("es/index.html"), /experiencia profesional con C#, VB \.NET, WinForms, MySQL y SAP Crystal Reports/);
		assert.match(html.get("en/index.html"), /professional experience with C#, VB \.NET, WinForms, MySQL, and SAP Crystal Reports/);
		assert.match(html.get("es/index.html"), /búsqueda activa de oportunidades como desarrollador \.NET/);
		assert.match(html.get("en/index.html"), /actively seeking opportunities as a \.NET developer/);
		assert.match(html.get("es/cv/index.html"), /búsqueda activa de oportunidades como desarrollador \.NET/);
		assert.match(html.get("en/cv/index.html"), /actively seeking opportunities as a \.NET developer/);
		assert.equal((html.get("es/index.html").match(/class="skill-category"/g) ?? []).length, 4);
		assert.equal((html.get("es/index.html").match(/class="skill-subcategory"/g) ?? []).length, 11);
		assert.match(html.get("es/index.html"), /VB \.NET/);
		assert.match(html.get("es/index.html"), /\.NET 10/);
		assert.match(html.get("es/index.html"), /\.NET Framework/);
		assert.match(html.get("es/index.html"), /Actualmente en formación/);
		assert.match(html.get("en/cv/index.html"), /id="skills-list"[\s\S]*Languages:[\s\S]*C#[\s\S]*Version control:[\s\S]*Git/);
		assert.doesNotMatch(html.get("en/cv/index.html"), /Frequent professional use|Complementary professional use|Research and academic work|Currently learning/);
		assert.match(html.get("es/cv/index.html"), /<p>Desarrollador de Software \.NET<\/p>/);
		assert.match(html.get("en/cv/index.html"), /<p>\.NET Software Developer<\/p>/);
		assert.match(html.get("es/cv/index.html"), /Desarrollador de Software Junior/);
		assert.match(html.get("es/cv/index.html"), /datetime="2025-08-11">agosto de 2025<\/time> - <time datetime="2026-11-04">noviembre de 2026/);
		assert.match(html.get("es/cv/index.html"), /datetime="2024-08">agosto de 2024<\/time> - <time datetime="2025-12">diciembre de 2025/);
		assert.match(html.get("es/cv/index.html"), /datetime="2019-08">agosto de 2019<\/time> - <time datetime="2023-07">julio de 2023/);
		assert.match(html.get("es/cv/index.html"), /datetime="2014-03">marzo de 2014<\/time> - <time datetime="2017-12">diciembre de 2017/);
		assert.doesNotMatch(html.get("es/cv/index.html"), /Actualidad/);
		assert.match(html.get("en/cv/index.html"), /Junior Software Developer/);
		assert.match(html.get("en/cv/index.html"), /Microsoft \.NET, VB \.NET, C#, WinForms, MySQL, SAP Crystal Reports/);
		assert.match(html.get("en/cv/index.html"), /migrating 637 calls across approximately 250 files/);
		assert.doesNotMatch(html.get("en/index.html"), /My contributions as an employee/);
		assert.doesNotMatch(html.get("es/index.html"), /Mi participación como empleado/);
		assert.match(html.get("en/cv/index.html"), /class="cv-contact-row">[\s\S]*mrmalvicino\.com[\s\S]*\/in\/mrmalvicino[\s\S]*mrmalvicino@gmail\.com[\s\S]*\+54 \(911\) 5905-8729[\s\S]*General Pacheco, Buenos Aires/);
		assert.match(html.get("es/index.html"), /maps\/search\/\?api=1&amp;query=General%20Pacheco%2C%20Buenos%20Aires%2C%20Argentina/);
		assert.match(html.get("es/index.html"), /href="\/assets\/documents\/certificates\/tup-certificate\.pdf"[\s\S]*bi bi-award/);
		assert.match(html.get("es/index.html"), /href="\/assets\/documents\/certificates\/tup-certificate\.pdf" target="_blank" rel="noopener noreferrer"/);
		assert.match(html.get("es/index.html"), /Tecnicatura Universitaria en Programación \(12 de diciembre de 2024\)/);
		assert.match(html.get("en/cv/index.html"), /Technical Degree in Programming \(December 12, 2024\)/);
		assert.match(html.get("es/cv/index.html"), /Curso de Angular[\s\S]*Curso de Web API \.NET Core[\s\S]*Curso de Entity Framework &amp; LINQ[\s\S]*Curso de portugués Nivel 4/);
		assert.match(html.get("en/cv/index.html"), /Course in Angular[\s\S]*Course in Web API \.NET Core[\s\S]*Course in Entity Framework &amp; LINQ[\s\S]*Course in Portuguese, Level 4/);
		assert.doesNotMatch(html.get("es/cv/index.html"), /id="(?:careers|courses|languages)Lbl"/);
		assert.doesNotMatch([...html.values()].join("\n"), /Caseros|Título en trámite/);
		assert.doesNotMatch(html.get("en/index.html"), /Docker|Doxygen|GitFlow|Worked with|JSTL library|MongoDB/);
		assert.equal((html.get("es/index.html").match(/class="project-card"/g) ?? []).length, 3);
		assert.match(html.get("es/index.html"), /Membriana[\s\S]*deCauciones[\s\S]*Halley V2/);
		assert.match(html.get("es/index.html"), /data-project-id="membriana"[\s\S]*data-participation-mode="freelance-saas"/);
		assert.match(html.get("es/index.html"), /data-project-id="decauciones"[\s\S]*data-participation-mode="freelance-one-off"/);
		assert.match(html.get("es/index.html"), /data-project-id="halley-v2"[\s\S]*data-participation-mode="employment"/);
		assert.equal((html.get("en/projects/index.html").match(/class="project-card"/g) ?? []).length, 25);
		assert.match(html.get("en/projects/index.html"), /data-project-id="meeni-erp"[\s\S]*data-participation-mode="freelance-saas"/);
		assert.match(html.get("en/projects/index.html"), /data-project-id="physics-book"[\s\S]*data-participation-mode="independent-collaboration"/);
		assert.equal((html.get("en/projects/index.html").match(/name="tech"/g) ?? []).length, 20);
		assert.equal((html.get("en/projects/index.html").match(/name="type"/g) ?? []).length, 5);
		assert.equal((html.get("en/projects/index.html").match(/name="contribution"/g) ?? []).length, 5);
		assert.match(html.get("en/projects/index.html"), /data-technologies="dotnet csharp html css javascript mssql git"/);
		assert.match(html.get("en/projects/index.html"), /value="freelance-saas"[\s\S]*Freelance SaaS/);
		assert.match(html.get("en/projects/index.html"), /value="employment"[\s\S]*Employment/);
		assert.match(html.get("en/projects/index.html"), /<script src="\/script\/project-filters\.js" defer><\/script>/);
		assert.doesNotMatch(html.get("en/projects/index.html"), /email-copy\.js/);
		assert.equal((html.get("es/cv/index.html").match(/id="projects-list"[\s\S]*?<\/div>/)?.[0].match(/<article /g) ?? []).length, 2);
		assert.match(html.get("es/cv/index.html"), /Membriana[\s\S]*deCauciones/);
		assert.match(html.get("es/cv/index.html"), /Membriana[\s\S]*href="https:\/\/github\.com\/mrmalvicino\/membriana"/);
		assert.match(html.get("es/cv/index.html"), /href="https:\/\/github\.com\/mrmalvicino\/membriana" target="_blank" rel="noopener noreferrer"/);
		assert.match(html.get("es/cv/index.html"), /deCauciones[\s\S]*href="https:\/\/decauciones\.com"/);
		assert.doesNotMatch(html.get("es/cv/index.html"), /Meeni ERP|Ecommerce Net|Halley V2/);
		assert.match(html.get("es/cv/index.html"), /<header class="cv-header">[\s\S]*<address class="cv-contact">/);
		assert.match(html.get("es/cv/index.html"), /<main class="cv-main"[^>]*>[\s\S]*Perfil profesional[\s\S]*Habilidades técnicas[\s\S]*Experiencia laboral[\s\S]*Experiencia freelance[\s\S]*Educación/);
		assert.match(html.get("en/cv/index.html"), /Professional Profile[\s\S]*Technical Skills[\s\S]*Work Experience[\s\S]*Freelance Experience[\s\S]*Education/);
		assert.match(html.get("es/cv/index.html"), /<article class="cv-entry cv-job">[\s\S]*<h3>Desarrollador de Software Junior<\/h3>[\s\S]*Halley Accurate Solutions[\s\S]*<time datetime="2025-08-11">/);
		assert.doesNotMatch(html.get("es/cv/index.html"), /< Habilidades \/>|cv-left-column|cv-right-column|profile-img/);
		assert.doesNotMatch(html.get("es/cv/index.html"), /<script src=/);
		assert.equal((html.get("es/cv/index.html").match(/class="site-chrome/g) ?? []).length, 2);
		assert.equal((html.get("es/projects/index.html").match(/class="site-chrome/g) ?? []).length, 2);
		assert.match(html.get("en/projects/index.html"), /href="\/en\/"/);
		assert.doesNotMatch(html.get("en/projects/index.html"), /href="\/en\/" target="_blank"/);
		assert.match(html.get("en/projects/index.html"), /href="https:\/\/github\.com\/mrmalvicino\/membriana" target="_blank" rel="noopener noreferrer"/);
		assert.match(html.get("en/index.html"), /aria-label="GitHub \(opens in a new tab\)"/);
		assert.match(html.get("en/index.html"), /href="#main-content" class="skip-link">Skip to main content/);
		assert.match(html.get("es/index.html"), /aria-expanded="false" aria-controls="menu-list"/);
		assert.match(html.get("en/index.html"), /<thead class="visually-hidden">[\s\S]*<th scope="col">Institution/);
		assert.equal((html.get("en/index.html").match(/<th scope="row" class="education-description-cell">/g) ?? []).length, 9);
		assert.match(html.get("en/index.html"), /id="email-input" name="email-input" autocomplete="email" required/);
		assert.doesNotMatch(html.get("en/index.html"), /href="mailto:[^"]+"[^>]*target="_blank"/);
		assert.doesNotMatch(html.get("en/index.html"), /href="tel:[^"]+"[^>]*target="_blank"/);
		assert.match(html.get("en/cv/index.html"), /href="\/es\/cv\/"/);
		assert.match(html.get("es/index.html"), /src="\/assets\/images\/branding\/logo\.webp"[^>]*width="40" height="40"[^>]*decoding="async"/);
		assert.match(html.get("es/index.html"), /src="\/assets\/images\/profile\.webp"[^>]*width="500" height="500"[^>]*fetchpriority="high"/);
		assert.match(html.get("es/index.html"), /<meta property="og:image" content="https:\/\/mrmalvicino\.com\/assets\/images\/social\/open-graph-image\.png">/);
		assert.match(html.get("es/index.html"), /<meta name="twitter:image" content="https:\/\/mrmalvicino\.com\/assets\/images\/social\/open-graph-image\.png">/);
		assert.match(html.get("en/projects/index.html"), /src="\/assets\/images\/projects\/biblio-api\.webp"[^>]*width="16" height="9" loading="lazy" decoding="async"/);
		assert.match(html.get("en/index.html"), /src="\/assets\/images\/projects\/decauciones\.webp"/);
		assert.match(html.get("en/index.html"), /src="\/assets\/images\/projects\/halley-v2\.webp"/);
		assert.match(html.get("en/index.html"), /href="https:\/\/v2\.sistemahalley\.com\.ar"[\s\S]*bi bi-globe2[\s\S]*Website/);
		assert.match(html.get("en/projects/index.html"), /src="\/assets\/images\/technologies\/react\.svg"/);
		assert.match(html.get("en/projects/index.html"), /<iframe[^>]*width="16" height="9" loading="lazy" allowfullscreen><\/iframe>/);
		assert.doesNotMatch([...html.values()].join("\n"), /fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net/);
		assert.match(rootHtml, /new URLSearchParams\(window\.location\.search\)\.get\("lang"\)/);
		assert.match(rootHtml, /<meta name="robots" content="noindex, follow">/);
		assert.match(legacyProjects, /window\.location\.replace\("\/" \+ language \+ "\/projects\/"\)/);
		assert.match(sitemap, /<loc>https:\/\/mrmalvicino\.com\/es\/<\/loc>/);
		assert.match(sitemap, /<loc>https:\/\/mrmalvicino\.com\/en\/cv\/<\/loc>/);
		assert.equal((sitemap.match(/<url>/g) ?? []).length, 6);
		assert.doesNotMatch(sitemap, /projects\.html|cv\.html/);
		assert.equal(robots, "User-agent: *\nAllow: /\n\nSitemap: https://mrmalvicino.com/sitemap.xml\n");
		assert.doesNotMatch(rootHtml, /project-card|legacy-language\.js/);

		for (const [route, contents] of html) {
			const structuredData = contents.match(/<script type="application\/ld\+json">(.+)<\/script>/)?.[1];

			assert.ok(structuredData, `${route} must include JSON-LD`);
			assert.doesNotThrow(() => JSON.parse(structuredData));
			assert.doesNotMatch(contents, /fetch\s*\(|data-site-|\{\{|undefined/);
			assert.doesNotMatch(contents, /(?:src|href)="[^"]*data\/(?:site|es|en)\.json/);
			assert.doesNotMatch(contents, /\sstyle="/);
			await assertLocalReferencesExist(output, route, contents);
		}

		for (const route of htmlRoutes) {
			assert.doesNotMatch(html.get(route), /legacy-language\.js|data-english-route|\?lang=/);
		}

		const files = await listFiles(output);
		const iconCss = await readFile(path.join(output, "style/bundles/index.css"), "utf8");
		const iconNames = new Set([...html.values()].flatMap(contents => (
			[...contents.matchAll(/\bbi-([a-z0-9-]+)/g)].map(match => match[1])
		)));
		iconNames.add("x-lg");

		for (const iconName of iconNames) {
			assert.match(iconCss, new RegExp(`\\.bi-${iconName}::before`));
		}

		assert.equal(files.some(file => path.basename(file) === ".DS_Store"), false);
		assert.equal(files.some(file => file.startsWith("data/")), false);
		assert.equal(files.includes("footer.html"), false);
		assert.equal(files.some(file => file.startsWith("tools/")), false);
		assert.equal(files.includes("script/data-loader.js"), false);
		assert.equal(files.includes("script/legacy-language.js"), false);
		assert.equal(files.includes("assets/design/linkedin/portfolio.png"), false);
		assert.equal(files.includes("assets/design/linkedin/cv.png"), false);
		assert.equal(files.includes("assets/design/logo/logo.svg"), false);
		assert.equal(files.includes("assets/design/youtube/youtube-cover.svg"), false);
		assert.equal(files.includes("projects.html"), true);
		assert.equal(files.includes("cv.html"), true);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("build output reflects locale data changes", async () => {
	const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "portfolio-fixture-"));
	const fixture = path.join(temporaryRoot, "site");
	const output = path.join(temporaryRoot, "output");

	try {
		await mkdir(fixture);

		for (const relativePath of ["CNAME", "schemas", "src"]) {
			await cp(path.join(root, relativePath), path.join(fixture, relativePath), { recursive: true });
		}

		const localePath = path.join(fixture, "src/data/es.json");
		const locale = JSON.parse(await readFile(localePath, "utf8"));
		locale.labels.index.skillsLbl = "Contenido <script> de prueba";
		locale.labels.common.presentationLbl = "Contenido sincronizado con el PDF de prueba.";
		await writeFile(localePath, `${JSON.stringify(locale, null, 2)}\n`, "utf8");

		const sitePath = path.join(fixture, "src/data/site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));
		site.profile.jobSearchActive = false;
		await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`, "utf8");
		await buildSite(fixture, output);

		const localizedHtml = await readFile(path.join(output, "es/index.html"), "utf8");
		const localizedPdfText = await extractPdfText(path.join(output, "assets/cv/malvicino-es.pdf"));

		assert.match(localizedHtml, /Contenido &lt;script&gt; de prueba/);
		assert.doesNotMatch(localizedHtml, /Contenido <script>/);
		assert.doesNotMatch(localizedHtml, /job-search-label|búsqueda activa/);
		assert.match(localizedPdfText, /Contenido sincronizado con el PDF de prueba\./);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("build refuses to delete the project root", async () => {
	await assert.rejects(
		buildSite(root, root),
		/Build output cannot be the project root or one of its parent directories\./
	);

	await stat(path.join(root, "package.json"));
});
