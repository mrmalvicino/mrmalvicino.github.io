import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { buildSite } from "../tools/build.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlRoutes = [
	"es/index.html",
	"en/index.html",
	"es/projects/index.html",
	"en/projects/index.html",
	"es/cv/index.html",
	"en/cv/index.html"
];
const foundationStyles = ["variables.css", "controls.css", "buttons.css", "images.css", "site-chrome.css"];
const utilityStyles = ["colors.css", "flexbox.css", "fonts.css", "heights.css", "margins.css", "paddings.css", "widths.css"];

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
			stat(path.join(output, "style/variables.css")),
			stat(path.join(output, "script/menu.js")),
			stat(path.join(output, "script/email-copy.js")),
			stat(path.join(output, "script/project-filters.js")),
			stat(path.join(output, "style/projects.css")),
			stat(path.join(output, "assets/images/logo.png")),
			stat(path.join(output, "assets/images/projects/biblio-api.jpeg")),
			stat(path.join(output, "assets/images/projects/decauciones.webp")),
			stat(path.join(output, "assets/images/projects/halley-v2.webp")),
			stat(path.join(output, "assets/images/technologies/angular.png")),
			stat(path.join(output, "assets/images/technologies/razor.svg")),
			stat(path.join(output, "assets/images/technologies/react.svg")),
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
		const pageStyles = {
			"es/index.html": ["portfolio.css", "project-cards.css", "inputs.css", "table.css"],
			"en/index.html": ["portfolio.css", "project-cards.css", "inputs.css", "table.css"],
			"es/projects/index.html": ["project-cards.css", "projects.css"],
			"en/projects/index.html": ["project-cards.css", "projects.css"],
			"es/cv/index.html": ["cv.css"],
			"en/cv/index.html": ["cv.css"]
		};

		for (const [route, styles] of Object.entries(pageStyles)) {
			assert.deepEqual(getLocalStyles(html.get(route)), [...foundationStyles, ...styles, ...utilityStyles]);
		}

		assert.match(html.get("es/index.html"), /<html lang="es">/);
		assert.match(html.get("en/index.html"), /<html lang="en">/);
		assert.match(html.get("es/index.html"), /Desarrollador de Software \.NET/);
		assert.match(html.get("en/index.html"), />\.NET Software Developer</);
		assert.match(html.get("es/index.html"), /id="onlineResumeBtn" href="\/es\/cv\/"[\s\S]*Ver CV online/);
		assert.match(html.get("en/index.html"), /id="onlineResumeBtn" href="\/en\/cv\/"[\s\S]*View CV online/);
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
		assert.match(html.get("en/cv/index.html"), /id="skillsLst"[\s\S]*Languages:[\s\S]*C#[\s\S]*Version control:[\s\S]*Git/);
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
		assert.match(html.get("en/cv/index.html"), /VB \.NET, C#, Microsoft \.NET, WinForms, MySQL, SAP Crystal Reports/);
		assert.match(html.get("en/cv/index.html"), /migrating 637 calls across approximately 250 files/);
		assert.doesNotMatch(html.get("en/index.html"), /My contributions as an employee/);
		assert.doesNotMatch(html.get("es/index.html"), /Mi participación como empleado/);
		assert.match(html.get("en/cv/index.html"), /class="cv-contact-row">[\s\S]*mrmalvicino\.com[\s\S]*\/in\/mrmalvicino[\s\S]*mrmalvicino@gmail\.com[\s\S]*\+54 \(911\) 5905-8729[\s\S]*General Pacheco, Buenos Aires/);
		assert.match(html.get("es/index.html"), /maps\/search\/\?api=1&amp;query=General%20Pacheco%2C%20Buenos%20Aires%2C%20Argentina/);
		assert.match(html.get("es/index.html"), /href="\/assets\/pdf\/tup-certificate\.pdf"[\s\S]*bi bi-award/);
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
		assert.match(html.get("en/projects/index.html"), /<script src="\/script\/project-filters\.js"><\/script>/);
		assert.equal((html.get("es/cv/index.html").match(/id="projectsLst"[\s\S]*?<\/div>/)?.[0].match(/<article /g) ?? []).length, 2);
		assert.match(html.get("es/cv/index.html"), /Membriana[\s\S]*deCauciones/);
		assert.match(html.get("es/cv/index.html"), /Membriana[\s\S]*href="https:\/\/github\.com\/mrmalvicino\/membriana"/);
		assert.match(html.get("es/cv/index.html"), /deCauciones[\s\S]*href="https:\/\/decauciones\.com"/);
		assert.doesNotMatch(html.get("es/cv/index.html"), /Meeni ERP|Ecommerce Net|Halley V2/);
		assert.match(html.get("es/cv/index.html"), /<header class="cv-header">[\s\S]*<address class="cv-contact">/);
		assert.match(html.get("es/cv/index.html"), /<main class="cv-main">[\s\S]*Perfil profesional[\s\S]*Habilidades técnicas[\s\S]*Experiencia laboral[\s\S]*Experiencia freelance[\s\S]*Educación/);
		assert.match(html.get("en/cv/index.html"), /Professional Profile[\s\S]*Technical Skills[\s\S]*Work Experience[\s\S]*Freelance Experience[\s\S]*Education/);
		assert.match(html.get("es/cv/index.html"), /<article class="cv-entry cv-job">[\s\S]*<h3>Desarrollador de Software Junior<\/h3>[\s\S]*Halley Accurate Solutions[\s\S]*<time datetime="2025-08-11">/);
		assert.doesNotMatch(html.get("es/cv/index.html"), /< Habilidades \/>|cv-left-column|cv-right-column|profileImg/);
		assert.doesNotMatch(html.get("es/cv/index.html"), /<script/);
		assert.equal((html.get("es/cv/index.html").match(/class="site-chrome/g) ?? []).length, 2);
		assert.equal((html.get("es/projects/index.html").match(/class="site-chrome/g) ?? []).length, 2);
		assert.match(html.get("en/projects/index.html"), /href="\/en\/"/);
		assert.match(html.get("en/cv/index.html"), /href="\/es\/cv\/"/);
		assert.match(html.get("es/index.html"), /src="\/assets\/images\/logo\.png"/);
		assert.match(html.get("en/projects/index.html"), /src="\/assets\/images\/projects\/biblio-api\.jpeg"/);
		assert.match(html.get("en/index.html"), /src="\/assets\/images\/projects\/decauciones\.webp"/);
		assert.match(html.get("en/index.html"), /src="\/assets\/images\/projects\/halley-v2\.webp"/);
		assert.match(html.get("en/index.html"), /href="https:\/\/v2\.sistemahalley\.com\.ar"[\s\S]*bi bi-globe2[\s\S]*Website/);
		assert.match(html.get("en/projects/index.html"), /src="\/assets\/images\/technologies\/react\.svg"/);
		assert.match(rootHtml, /window\.location\.replace\(browserLanguage\?\.toLowerCase\(\)\.startsWith\("es"\) \? "\/es\/" : "\/en\/"\)/);
		assert.doesNotMatch(rootHtml, /\?lang=|project-card|legacy-language\.js/);

		for (const [route, contents] of html) {
			assert.doesNotMatch(contents, /fetch\s*\(|data-site-|\{\{|\}\}|undefined/);
			assert.doesNotMatch(contents, /(?:src|href)="[^"]*data\/(?:site|es|en)\.json/);
			assert.doesNotMatch(contents, /\sstyle="/);
			await assertLocalReferencesExist(output, route, contents);
		}

		for (const route of htmlRoutes) {
			assert.doesNotMatch(html.get(route), /legacy-language\.js|data-english-route|\?lang=/);
		}

		const files = await listFiles(output);
		assert.equal(files.some(file => path.basename(file) === ".DS_Store"), false);
		assert.equal(files.some(file => file.startsWith("data/")), false);
		assert.equal(files.includes("footer.html"), false);
		assert.equal(files.some(file => file.startsWith("tools/")), false);
		assert.equal(files.includes("script/data-loader.js"), false);
		assert.equal(files.includes("script/legacy-language.js"), false);
		assert.equal(files.includes("projects.html"), false);
		assert.equal(files.includes("cv.html"), false);
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
		assert.doesNotMatch(localizedHtml, /jobSearchLbl|búsqueda activa/);
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
