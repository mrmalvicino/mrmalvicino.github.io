import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	renderCvPage,
	renderCompatibilityRedirectPage,
	renderLanguageRedirectPage,
	renderPortfolioPage,
	renderProjectsPage
} from "./render/index.mjs";
import { generateResumePdfs } from "./generate-pdf.mjs";
import { optimizeAssets } from "./optimize-assets.mjs";
import { loadSiteData } from "./site-data.mjs";
import { languages, outputFile, pages, publicScripts, route } from "./site-manifest.mjs";
import { validateSite } from "./validate.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const publishPaths = [
	{ source: "CNAME", destination: "CNAME" }
];

const renderers = {
	index: renderPortfolioPage,
	projects: renderProjectsPage,
	cv: renderCvPage
};

function renderSitemap(baseUrl) {
	const routes = pages.flatMap(page => languages.map(language => ({ language: language.id, page: page.id })));
	const urls = routes.map(({ language, page }) => {
		const pathname = route(language, page);
		const alternates = languages.map(item => (
			`    <xhtml:link rel="alternate" hreflang="${item.id}" href="${baseUrl}${route(item.id, page)}" />`
		)).join("\n");

		return [
			"  <url>",
			`    <loc>${baseUrl}${pathname}</loc>`,
			alternates,
			`    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/" />`,
			"  </url>"
		].join("\n");
	}).join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

function renderRobots(baseUrl) {
	return `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
}

function isSameOrParent(parent, candidate) {
	const relativePath = path.relative(parent, candidate);

	return relativePath === "" || (
		relativePath !== ".." &&
		!relativePath.startsWith(`..${path.sep}`) &&
		!path.isAbsolute(relativePath)
	);
}

function validateOutputPath(root, output) {
	const resolvedRoot = path.resolve(root);
	const resolvedOutput = path.resolve(output);
	const defaultOutput = path.join(resolvedRoot, "dist");

	if (isSameOrParent(resolvedOutput, resolvedRoot)) {
		throw new Error("Build output cannot be the project root or one of its parent directories.");
	}

	if (isSameOrParent(resolvedRoot, resolvedOutput) && resolvedOutput !== defaultOutput) {
		throw new Error("Build output inside the project must be the dist directory.");
	}

	for (const publishPath of publishPaths) {
		const source = path.join(resolvedRoot, publishPath.source);

		if (isSameOrParent(source, resolvedOutput) || isSameOrParent(resolvedOutput, source)) {
			throw new Error(`Build output overlaps required input: ${publishPath.source}`);
		}
	}
}

export async function buildSite(root = projectRoot, output = path.join(root, "dist")) {
	validateOutputPath(root, output);
	await validateSite(root);
	await rm(output, { recursive: true, force: true });
	await mkdir(output, { recursive: true });

	for (const publishPath of publishPaths) {
		const source = path.join(root, publishPath.source);

		try {
			await stat(source);
		} catch {
			throw new Error(`Required build input is missing: ${publishPath.source}`);
		}

		await cp(source, path.join(output, publishPath.destination), {
			recursive: true,
			filter: sourcePath => {
				if (path.basename(sourcePath) === ".DS_Store") {
					return false;
				}

				const relativePath = path.relative(path.join(root, "src/assets/images"), sourcePath);
				const isSourceImage = relativePath !== ".." && !relativePath.startsWith(`..${path.sep}`);

				return !isSourceImage || !/\.(?:jpe?g|png)$/i.test(sourcePath);
			}
		});
	}

	await optimizeAssets(root, output);
	await mkdir(path.join(output, "script"), { recursive: true });
	await Promise.all(publicScripts.map(script => (
		cp(path.join(root, "src/script", script), path.join(output, "script", script))
	)));

	for (const language of languages) {
		const data = await loadSiteData(root, language.id);

		for (const page of pages) {
			const destination = path.join(output, outputFile(language.id, page.id));

			await mkdir(path.dirname(destination), { recursive: true });
			await writeFile(destination, renderers[page.id](data), "utf8");
		}
	}

	await writeFile(path.join(output, "index.html"), renderLanguageRedirectPage(), "utf8");

	for (const page of pages.filter(item => item.legacyFile)) {
		await writeFile(path.join(output, page.legacyFile), renderCompatibilityRedirectPage(page.id), "utf8");
	}

	const siteData = await loadSiteData(root, languages[0].id);
	const baseUrl = siteData.site.profile.website.href.replace(/\/$/, "");

	await writeFile(path.join(output, "sitemap.xml"), renderSitemap(baseUrl), "utf8");
	await writeFile(path.join(output, "robots.txt"), renderRobots(baseUrl), "utf8");
	await generateResumePdfs(output);

	return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(projectRoot, "dist");
	await buildSite(projectRoot, output);
	console.log(`Build generated at ${path.relative(projectRoot, output) || "."}/`);
}
