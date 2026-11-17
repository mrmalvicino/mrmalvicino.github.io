import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
	"CNAME",
	"index.html",
	"projects.html",
	"cv.html",
	"robots.txt",
	"sitemap.xml",
	"es/index.html",
	"en/index.html",
	"es/projects/index.html",
	"en/projects/index.html",
	"es/cv/index.html",
	"en/cv/index.html",
	"assets/cv/malvicino-es.pdf",
	"assets/cv/malvicino-en.pdf",
	"style/bundles/index.css",
	"style/bundles/projects.css",
	"style/bundles/cv.css",
	"script/menu.js",
	"script/project-filters.js",
	"script/email-copy.js",
	"script/contact-form.js"
];
const localizedHtmlFiles = requiredFiles.filter(file => /^(?:es|en)\/.+\.html$/.test(file));
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

async function listFiles(directory, prefix = "") {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const relativePath = path.join(prefix, entry.name);

		if (entry.isSymbolicLink()) {
			throw new Error(`Publishable artifact contains a symbolic link: ${relativePath}`);
		}

		if (entry.isDirectory()) {
			files.push(...await listFiles(path.join(directory, entry.name), relativePath));
		} else {
			files.push(relativePath);
		}
	}

	return files;
}

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
	const files = await listFiles(output);

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

	for (const relativePath of ["assets/cv/malvicino-es.pdf", "assets/cv/malvicino-en.pdf"]) {
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
