import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
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

test("build creates localized HTML without runtime content data", async () => {
	const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "portfolio-build-"));
	const output = path.join(temporaryRoot, "dist");

	try {
		await buildSite(root, output);
		await Promise.all([
			...htmlRoutes.map(file => stat(path.join(output, file))),
			stat(path.join(output, "CNAME")),
			stat(path.join(output, "style/constants.css")),
			stat(path.join(output, "script/menu.js")),
			stat(path.join(output, "script/email-copy.js")),
			stat(path.join(output, "assets/images/logo.png")),
			stat(path.join(output, "assets/images/projects/biblio-api.jpeg")),
			stat(path.join(output, "assets/images/technologies/angular.png")),
			stat(path.join(output, "assets/images/technologies/react.svg")),
			stat(path.join(output, "assets/cv/malvicino-es.pdf"))
		]);

		const html = new Map(await Promise.all(htmlRoutes.map(async route => [
			route,
			await readFile(path.join(output, route), "utf8")
		])));
		const rootHtml = await readFile(path.join(output, "index.html"), "utf8");

		assert.match(html.get("es/index.html"), /<html lang="es">/);
		assert.match(html.get("en/index.html"), /<html lang="en">/);
		assert.match(html.get("es/index.html"), /Desarrollador Fullstack \.NET JR/);
		assert.match(html.get("en/index.html"), /JR \.NET Fullstack Developer/);
		assert.equal((html.get("es/index.html").match(/class="project-card"/g) ?? []).length, 3);
		assert.equal((html.get("en/projects/index.html").match(/class="project-card"/g) ?? []).length, 23);
		assert.equal((html.get("es/cv/index.html").match(/id="projectsLst"[\s\S]*?<\/ul>/)?.[0].match(/<li /g) ?? []).length, 3);
		assert.match(html.get("en/projects/index.html"), /href="\/en\/"/);
		assert.match(html.get("en/cv/index.html"), /href="\/es\/cv\/"/);
		assert.match(html.get("es/index.html"), /src="\/assets\/images\/logo\.png"/);
		assert.match(html.get("en/projects/index.html"), /src="\/assets\/images\/projects\/biblio-api\.jpeg"/);
		assert.match(html.get("en/projects/index.html"), /src="\/assets\/images\/technologies\/react\.svg"/);
		assert.match(rootHtml, /window\.location\.replace\(browserLanguage\?\.toLowerCase\(\)\.startsWith\("es"\) \? "\/es\/" : "\/en\/"\)/);
		assert.doesNotMatch(rootHtml, /\?lang=|project-card|legacy-language\.js/);

		for (const [route, contents] of html) {
			assert.doesNotMatch(contents, /fetch\s*\(|data-site-|\{\{|\}\}|undefined/);
			assert.doesNotMatch(contents, /(?:src|href)="[^"]*data\/(?:site|es|en)\.json/);
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
		await writeFile(localePath, `${JSON.stringify(locale, null, 2)}\n`, "utf8");
		await buildSite(fixture, output);

		const localizedHtml = await readFile(path.join(output, "es/index.html"), "utf8");

		assert.match(localizedHtml, /Contenido &lt;script&gt; de prueba/);
		assert.doesNotMatch(localizedHtml, /Contenido <script>/);
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
