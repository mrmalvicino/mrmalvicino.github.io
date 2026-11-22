import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { listFiles } from "./filesystem.mjs";
import { languages, outputFile, pages, publicScripts, resumeDocuments } from "./site-manifest.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
	"CNAME",
	"index.html",
	"robots.txt",
	"sitemap.xml",
	"assets/images/social/open-graph-image.png",
	"assets/fonts/bootstrap-icons.woff2",
	"assets/fonts/jost-latin-300-normal.woff2",
	"assets/fonts/open-sans-latin-wght-normal.woff2",
	"assets/images/branding/favicon.ico",
	...pages.filter(page => page.legacyFile).map(page => page.legacyFile),
	...languages.flatMap(language => pages.map(page => outputFile(language.id, page.id))),
	...resumeDocuments.map(document => `assets/cv/${document.fileName}`),
	...pages.map(page => `style/bundles/${page.id}.css`),
	...publicScripts.map(script => `script/${script}`)
];
const localizedHtmlFiles = languages.flatMap(language => pages.map(page => outputFile(language.id, page.id)));
const forbiddenTopLevelEntries = new Set([
	".git",
	".github",
	"node_modules",
	"schemas",
	"src",
	"test",
	"tools",
	"package.json",
	"package-lock.json",
	"playwright.config.mjs"
]);

async function assertFileExists(output, relativePath) {
	const fileStats = await stat(path.join(output, relativePath));

	if (!fileStats.isFile()) {
		throw new Error(`Required artifact path is not a file: ${relativePath}`);
	}
}

async function assertLocalReferencesExist(output, relativePath, contents) {
	for (const match of contents.matchAll(/(?:href|src|action)="([^"]+)"/g)) {
		const reference = match[1].replaceAll("&amp;", "&");

		if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(reference)) {
			continue;
		}

		const pageUrl = `https://local.invalid/${relativePath}`;
		const url = new URL(reference, pageUrl);
		const decodedPath = decodeURIComponent(url.pathname);
		const target = path.resolve(output, `.${decodedPath}`, decodedPath.endsWith("/") ? "index.html" : "");
		const relativeTarget = path.relative(output, target);

		if (relativeTarget === ".." || relativeTarget.startsWith(`..${path.sep}`) || path.isAbsolute(relativeTarget)) {
			throw new Error(`${relativePath}: local reference leaves the artifact: ${reference}`);
		}

		try {
			await assertFileExists(output, relativeTarget);
		} catch {
			throw new Error(`${relativePath}: local reference is missing: ${reference}`);
		}
	}
}

export async function verifyDist(output = path.join(projectRoot, "dist")) {
	const files = await listFiles(output, { rejectSymbolicLinks: true });

	for (const relativePath of requiredFiles) {
		await assertFileExists(output, relativePath);
	}

	for (const file of files) {
		const [topLevelEntry] = file.split(path.sep);
		const baseName = path.basename(file);

		if (forbiddenTopLevelEntries.has(topLevelEntry)) {
			throw new Error(`Publishable artifact contains a development entry: ${file}`);
		}

		if (baseName === ".DS_Store" || baseName.startsWith(".env") || baseName.endsWith(".map")) {
			throw new Error(`Publishable artifact contains a forbidden file: ${file}`);
		}
	}

	const cname = (await readFile(path.join(output, "CNAME"), "utf8")).trim();

	if (cname !== "mrmalvicino.com") {
		throw new Error(`CNAME must contain mrmalvicino.com, received: ${cname || "<empty>"}`);
	}

	for (const relativePath of localizedHtmlFiles) {
		const contents = await readFile(path.join(output, relativePath), "utf8");

		if (!contents.includes("<main")) {
			throw new Error(`${relativePath}: generated page does not contain its main content.`);
		}

		await assertLocalReferencesExist(output, relativePath, contents);
	}

	for (const relativePath of resumeDocuments.map(document => `assets/cv/${document.fileName}`)) {
		const contents = await readFile(path.join(output, relativePath));

		if (contents.byteLength < 10000 || contents.subarray(0, 5).toString() !== "%PDF-") {
			throw new Error(`${relativePath}: generated PDF is missing or invalid.`);
		}
	}

	console.log(`Artifact verified: ${files.length} publishable files from one build.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(projectRoot, "dist");

	await verifyDist(output);
}
