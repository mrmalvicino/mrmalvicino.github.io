import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["en", "es"];
const dataShapes = {
	buttons: ["index_page_buttons"],
	images: ["common_images", "technologies_images", "institutions_images", "projects_images"],
	jobs: ["jobs"],
	labels: ["common_labels", "index_page_labels", "projects_page_labels", "cv_page_labels"],
	menu: ["menu_items"],
	projects: ["projects"],
	skills: ["banner_items", "stacks"],
	studies: ["studies"],
	textboxes: ["index_page_textboxes"]
};

const htmlFiles = ["index.html", "projects.html", "cv.html", "footer.html"];
const localJsonKeys = new Set(["href", "src", "study_plan", "certificate"]);

function isExternalReference(reference) {
	return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference);
}

function toSitePath(reference, documentPath = "index.html") {
	const url = new URL(reference, `https://local.invalid/${documentPath}`);
	return decodeURIComponent(url.pathname).replace(/^\/+/, "");
}

async function pathExists(filePath) {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function validateReference(root, reference, source, errors, documentPath = "index.html") {
	if (!reference || reference.startsWith("#") || reference.startsWith("?") || isExternalReference(reference)) {
		return;
	}

	let sitePath;

	try {
		sitePath = toSitePath(reference, documentPath);
	} catch {
		errors.push(`${source}: local reference is invalid: ${reference}`);
		return;
	}

	const resolvedRoot = path.resolve(root);
	const target = path.resolve(resolvedRoot, sitePath);
	const relativePath = path.relative(resolvedRoot, target);

	const escapesRoot = (
		relativePath === ".." ||
		relativePath.startsWith(`..${path.sep}`) ||
		path.isAbsolute(relativePath)
	);

	if (escapesRoot) {
		errors.push(`${source}: local reference escapes the site root: ${reference}`);
		return;
	}

	if (!sitePath || !(await pathExists(target))) {
		errors.push(`${source}: local reference does not exist: ${reference}`);
	}
}

function collectJsonReferences(value, references, key = "") {
	if (Array.isArray(value)) {
		value.forEach(item => collectJsonReferences(item, references, key));
		return;
	}

	if (value && typeof value === "object") {
		for (const [childKey, childValue] of Object.entries(value)) {
			collectJsonReferences(childValue, references, childKey);
		}
		return;
	}

	if (typeof value === "string" && localJsonKeys.has(key)) {
		references.push(value);
	}
}

async function readJsonData(root, errors) {
	const data = new Map();
	let fileNames = [];

	try {
		fileNames = (await readdir(path.join(root, "data")))
			.filter(name => name.endsWith(".json"))
			.sort();
	} catch {
		errors.push("data/: directory does not exist");
		return data;
	}

	for (const fileName of fileNames) {
		try {
			const contents = await readFile(path.join(root, "data", fileName), "utf8");
			data.set(fileName, JSON.parse(contents));
		} catch (error) {
			errors.push(`data/${fileName}: invalid JSON (${error.message})`);
		}
	}

	return data;
}

function validateDataFiles(data, errors) {
	for (const [category, requiredKeys] of Object.entries(dataShapes)) {
		for (const language of languages) {
			const fileName = `${category}-${language}.json`;
			const contents = data.get(fileName);

			if (!contents) {
				errors.push(`data/${fileName}: required localized data file is missing`);
				continue;
			}

			for (const key of requiredKeys) {
				if (!(key in contents)) {
					errors.push(`data/${fileName}: required top-level key is missing: ${key}`);
				}
			}
		}
	}

	for (const fileName of data.keys()) {
		const match = fileName.match(/^(.*)-(en|es)\.json$/);
		if (match) {
			const counterpart = `${match[1]}-${match[2] === "en" ? "es" : "en"}.json`;
			if (!data.has(counterpart)) {
				errors.push(`data/${fileName}: localized counterpart is missing: ${counterpart}`);
			}
		}
	}
}

function validateIdReferences(data, indexHtml, errors) {
	const pageIds = new Set([...indexHtml.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));

	for (const language of languages) {
		const images = data.get(`images-${language}.json`);
		const projects = data.get(`projects-${language}.json`);
		const skills = data.get(`skills-${language}.json`);
		const studies = data.get(`studies-${language}.json`);
		const menu = data.get(`menu-${language}.json`);

		if (!images || !projects || !skills || !studies || !menu) {
			continue;
		}

		const imageGroups = [
			images.common_images,
			images.technologies_images,
			images.institutions_images,
			images.projects_images
		];

		const imageIds = new Set(imageGroups.flat().map(image => image.id));

		for (const id of skills.banner_items) {
			if (!imageIds.has(id)) {
				errors.push(`data/skills-${language}.json: unknown image id: ${id}`);
			}
		}

		for (const project of projects.projects) {
			for (const id of project.technologies_ids) {
				if (!imageIds.has(id)) {
					errors.push(`data/projects-${language}.json: unknown image id: ${id}`);
				}
			}

			if (project.mockup_id && !imageIds.has(project.mockup_id)) {
				errors.push(`data/projects-${language}.json: unknown image id: ${project.mockup_id}`);
			}
		}

		for (const study of studies.studies) {
			if (!imageIds.has(study.institution_id)) {
				errors.push(`data/studies-${language}.json: unknown image id: ${study.institution_id}`);
			}
		}

		for (const item of menu.menu_items) {
			if (item.href?.startsWith("#") && !pageIds.has(item.href.slice(1))) {
				errors.push(`data/menu-${language}.json: unknown index.html fragment: ${item.href}`);
			}
		}
	}
}

async function validateHtmlAndCss(root, htmlContents, errors) {
	for (const [fileName, contents] of htmlContents) {
		const references = [...contents.matchAll(/\b(?:href|src|action)\s*=\s*["']([^"']+)["']/gi)];

		for (const [, reference] of references) {
			await validateReference(root, reference, fileName, errors, fileName);
		}
	}

	let cssFiles = [];

	try {
		cssFiles = (await readdir(path.join(root, "style"))).filter(name => name.endsWith(".css"));
	} catch {
		errors.push("style/: directory does not exist");
		return;
	}

	for (const fileName of cssFiles) {
		const contents = await readFile(path.join(root, "style", fileName), "utf8");

		for (const match of contents.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
			await validateReference(root, match[1], `style/${fileName}`, errors, `style/${fileName}`);
		}
	}
}

export async function validateSite(root = projectRoot) {
	const errors = [];
	const htmlContents = new Map();

	for (const fileName of htmlFiles) {
		try {
			htmlContents.set(fileName, await readFile(path.join(root, fileName), "utf8"));
		} catch {
			errors.push(`${fileName}: required HTML file is missing`);
		}
	}

	for (const requiredPath of ["CNAME", "assets", "script", "style"]) {
		if (!(await pathExists(path.join(root, requiredPath)))) {
			errors.push(`${requiredPath}: required build input is missing`);
		}
	}

	const data = await readJsonData(root, errors);
	validateDataFiles(data, errors);
	await validateHtmlAndCss(root, htmlContents, errors);

	for (const [fileName, contents] of data) {
		const references = [];
		collectJsonReferences(contents, references);

		for (const reference of references) {
			await validateReference(root, reference, `data/${fileName}`, errors);
		}
	}

	if (htmlContents.has("index.html")) {
		validateIdReferences(data, htmlContents.get("index.html"), errors);
	}

	if (errors.length > 0) {
		throw new Error(`Validation failed:\n- ${errors.join("\n- ")}`);
	}

	return { jsonFiles: data.size, htmlFiles: htmlContents.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	try {
		const result = await validateSite(projectRoot);
		console.log(`Validation passed (${result.htmlFiles} HTML files, ${result.jsonFiles} JSON files).`);
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
