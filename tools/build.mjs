import { cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	renderCvPage,
	renderLanguageRedirectPage,
	renderPortfolioPage,
	renderProjectsPage
} from "./render-html.mjs";
import { loadSiteData } from "./site-data.mjs";
import { validateSite } from "./validate.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const publishPaths = [
	{ source: "CNAME", destination: "CNAME" },
	{ source: "src/assets", destination: "assets" },
	{ source: "src/script", destination: "script" },
	{ source: "src/style", destination: "style" }
];

const pages = [
	{ name: "index", render: renderPortfolioPage },
	{ name: "projects", render: renderProjectsPage },
	{ name: "cv", render: renderCvPage }
];

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
			filter: sourcePath => path.basename(sourcePath) !== ".DS_Store"
		});
	}

	for (const language of ["es", "en"]) {
		const data = await loadSiteData(root, language);

		for (const page of pages) {
			const directory = page.name === "index"
				? path.join(output, language)
				: path.join(output, language, page.name);

			await mkdir(directory, { recursive: true });
			await writeFile(path.join(directory, "index.html"), page.render(data), "utf8");
		}
	}

	await writeFile(path.join(output, "index.html"), renderLanguageRedirectPage(), "utf8");

	return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(projectRoot, "dist");
	await buildSite(projectRoot, output);
	console.log(`Build generated at ${path.relative(projectRoot, output) || "."}/`);
}
