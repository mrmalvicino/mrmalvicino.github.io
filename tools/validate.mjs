import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv from "ajv";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["en", "es"];
const dataFiles = ["site.json", ...languages.map(language => `${language}.json`)];
const htmlFiles = ["index.html", "projects.html", "cv.html", "footer.html"];
const localJsonKeys = new Set(["href", "src", "study_plan", "certificate"]);
const schemaBaseUrl = "https://mrmalvicino.com/schemas/";

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
	const escapesRoot = relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath);

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

function formatSchemaError(error) {
	return `${error.instancePath || "/"} ${error.message}`;
}

async function readJson(root, relativePath, errors) {
	try {
		const contents = await readFile(path.join(root, relativePath), "utf8");
		return JSON.parse(contents);
	} catch (error) {
		errors.push(`${relativePath}: invalid JSON (${error.message})`);
		return null;
	}
}

async function readData(root, errors) {
	const data = new Map();
	let actualFiles = [];

	try {
		actualFiles = (await readdir(path.join(root, "data"))).filter(fileName => fileName.endsWith(".json")).sort();
	} catch {
		errors.push("data/: directory does not exist");
		return data;
	}

	for (const fileName of dataFiles) {
		if (!actualFiles.includes(fileName)) {
			errors.push(`data/${fileName}: required data file is missing`);
			continue;
		}

		data.set(fileName, await readJson(root, `data/${fileName}`, errors));
	}

	for (const fileName of actualFiles) {
		if (!dataFiles.includes(fileName)) {
			errors.push(`data/${fileName}: obsolete or unsupported data file`);
		}
	}

	return data;
}

async function validateSchemas(root, data, errors) {
	const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
	const commonSchema = await readJson(root, "schemas/common.schema.json", errors);
	const siteSchema = await readJson(root, "schemas/site.schema.json", errors);
	const localeSchema = await readJson(root, "schemas/locale.schema.json", errors);

	if (!commonSchema || !siteSchema || !localeSchema) {
		return;
	}

	ajv.addSchema(commonSchema, `${schemaBaseUrl}common.schema.json`);

	let validateSite;
	let validateLocale;

	try {
		validateSite = ajv.compile(siteSchema);
		validateLocale = ajv.compile(localeSchema);
	} catch (error) {
		errors.push(`schemas/: schema is invalid (${error.message})`);
		return;
	}

	for (const fileName of dataFiles) {
		const contents = data.get(fileName);
		const validate = fileName === "site.json" ? validateSite : validateLocale;

		if (!contents) {
			continue;
		}

		if (!validate(contents)) {
			for (const error of validate.errors) {
				errors.push(`data/${fileName}: schema violation: ${formatSchemaError(error)}`);
			}
		}
	}
}

function validateUniqueCollection(items, collection, errors, globalIds = null) {
	const ids = new Set();
	const orders = new Set();

	for (const item of items ?? []) {
		if (ids.has(item.id) || globalIds?.has(item.id)) {
			errors.push(`data/site.json: duplicate id in ${collection}: ${item.id}`);
		}

		ids.add(item.id);
		globalIds?.add(item.id);

		if (item.order !== undefined) {
			if (orders.has(item.order)) {
				errors.push(`data/site.json: duplicate order in ${collection}: ${item.order}`);
			}

			orders.add(item.order);
		}
	}
}

function compareKeys(actual, expected, source, errors) {
	const actualKeys = Object.keys(actual ?? {}).sort();
	const expectedKeys = [...expected].sort();

	if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
		errors.push(`${source}: translation keys do not match domain ids`);
	}
}

function getAtPath(value, propertyPath) {
	return propertyPath.split(".").reduce((current, key) => current?.[key], value);
}

function validateBindings(site, locale, htmlContents, errors) {
	const values = {
		configuration: site.configuration,
		profile: {
			...site.profile,
			...locale.profile
		}
	};
	const socialIds = new Set(site.profile.socials.map(social => social.id));

	for (const [fileName, contents] of htmlContents) {
		for (const match of contents.matchAll(/data-site-(?:text|href|action)=["']([^"']+)["']/g)) {
			if (getAtPath(values, match[1]) === undefined) {
				errors.push(`${fileName}: unknown shared data binding: ${match[1]}`);
			}
		}

		for (const match of contents.matchAll(/data-social-id=["']([^"']+)["']/g)) {
			if (!socialIds.has(match[1])) {
				errors.push(`${fileName}: unknown social id: ${match[1]}`);
			}
		}
	}
}

function validateTranslations(site, locales, errors) {
	const imageIds = Object.values(site.images).flatMap(images => Object.keys(images));
	const technologyImageIds = new Set(Object.values(site.technologies).map(technology => technology.imageId));
	const expected = {
		images: imageIds,
		technologies: Object.keys(site.technologies),
		institutions: Object.keys(site.institutions),
		menu: site.menu.map(item => item.id),
		projects: site.projects.map(item => item.id),
		skills: site.skills.stacks.map(item => item.id),
		studies: site.studies.map(item => item.id),
		jobs: site.jobs.map(item => item.id),
		socials: site.profile.socials.map(item => item.id),
		buttons: [site.controls.submitButtonId],
		placeholders: site.controls.textboxIds
	};

	for (const [language, locale] of locales) {
		for (const [collection, ids] of Object.entries(expected)) {
			compareKeys(locale?.[collection], ids, `data/${language}.json ${collection}`, errors);
		}

		for (const [group, ids] of Object.entries(site.controls.labelIds)) {
			compareKeys(locale?.labels?.[group], ids, `data/${language}.json labels.${group}`, errors);
		}

		for (const imageId of imageIds) {
			if (!locale.images[imageId]?.title && !technologyImageIds.has(imageId)) {
				errors.push(`data/${language}.json images: missing title for ${imageId}`);
			}
		}
	}
}

function validateDomain(site, indexHtml, errors) {
	const collections = {
		menu: site.menu,
		projects: site.projects,
		stacks: site.skills.stacks,
		studies: site.studies,
		jobs: site.jobs,
		socials: site.profile.socials
	};

	for (const [name, items] of Object.entries(collections)) {
		validateUniqueCollection(items, name, errors);
	}

	const allImageIds = new Set();

	for (const [name, images] of Object.entries(site.images)) {
		for (const id of Object.keys(images)) {
			if (allImageIds.has(id)) {
				errors.push(`data/site.json: duplicate id in ${name}: ${id}`);
			}

			allImageIds.add(id);
		}
	}

	const technologyIds = new Set(Object.keys(site.images.technologies_images));
	const institutionIds = new Set(Object.keys(site.images.institutions_images));
	const projectImageIds = new Set(Object.keys(site.images.projects_images));
	const technologyEntityIds = new Set(Object.keys(site.technologies));
	const institutionEntityIds = new Set(Object.keys(site.institutions));
	const referencedTechnologyImageIds = new Set();
	const referencedInstitutionImageIds = new Set();

	for (const [id, technology] of Object.entries(site.technologies)) {
		if (referencedTechnologyImageIds.has(technology.imageId)) {
			errors.push(`data/site.json: technology image id is reused: ${technology.imageId}`);
		}

		referencedTechnologyImageIds.add(technology.imageId);

		if (!technologyIds.has(technology.imageId)) {
			errors.push(`data/site.json: unknown technology image id for ${id}: ${technology.imageId}`);
		}
	}

	for (const [id, institution] of Object.entries(site.institutions)) {
		if (referencedInstitutionImageIds.has(institution.imageId)) {
			errors.push(`data/site.json: institution image id is reused: ${institution.imageId}`);
		}

		referencedInstitutionImageIds.add(institution.imageId);

		if (!institutionIds.has(institution.imageId)) {
			errors.push(`data/site.json: unknown institution image id for ${id}: ${institution.imageId}`);
		}
	}

	if (referencedTechnologyImageIds.size !== technologyIds.size) {
		errors.push("data/site.json: every technology image must belong to one technology");
	}

	if (referencedInstitutionImageIds.size !== institutionIds.size) {
		errors.push("data/site.json: every institution image must belong to one institution");
	}

	for (const id of site.skills.bannerTechnologyIds) {
		if (!technologyEntityIds.has(id)) {
			errors.push(`data/site.json: unknown banner technology id: ${id}`);
		}
	}

	for (const project of site.projects) {
		for (const id of project.technologyIds) {
			if (!technologyEntityIds.has(id)) {
				errors.push(`data/site.json: unknown project technology id: ${id}`);
			}
		}

		if (project.mockup_id && !projectImageIds.has(project.mockup_id)) {
			errors.push(`data/site.json: unknown project image id: ${project.mockup_id}`);
		}
	}

	for (const study of site.studies) {
		if (!institutionEntityIds.has(study.institutionId)) {
			errors.push(`data/site.json: unknown study institution id: ${study.institutionId}`);
		}
	}

	if (!projectImageIds.has("wipImg")) {
		errors.push("data/site.json: required project image id is missing: wipImg");
	}

	const pageIds = new Set([...indexHtml.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));

	for (const item of site.menu) {
		if (item.href.startsWith("#") && !pageIds.has(item.href.slice(1))) {
			errors.push(`data/site.json: unknown index.html fragment: ${item.href}`);
		}
	}

	for (const id of [site.controls.resumeButtonId, site.controls.submitButtonId, ...site.controls.textboxIds]) {
		if (!pageIds.has(id)) {
			errors.push(`data/site.json: unknown index.html control id: ${id}`);
		}
	}
}

async function validateHtmlAndCss(root, htmlContents, errors) {
	for (const [fileName, contents] of htmlContents) {
		for (const match of contents.matchAll(/(?:^|\s)(?:href|src|action)\s*=\s*["']([^"']+)["']/gi)) {
			await validateReference(root, match[1], fileName, errors, fileName);
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

	for (const requiredPath of ["CNAME", "assets", "data", "schemas", "script", "style"]) {
		if (!(await pathExists(path.join(root, requiredPath)))) {
			errors.push(`${requiredPath}: required build input is missing`);
		}
	}

	const data = await readData(root, errors);
	await validateSchemas(root, data, errors);
	await validateHtmlAndCss(root, htmlContents, errors);

	for (const [fileName, contents] of data) {
		const references = [];
		collectJsonReferences(contents, references);

		for (const reference of references) {
			await validateReference(root, reference, `data/${fileName}`, errors);
		}
	}

	const site = data.get("site.json");
	const locales = languages.map(language => [language, data.get(`${language}.json`)]);

	if (site && locales.every(([, locale]) => locale) && htmlContents.has("index.html")) {
		validateTranslations(site, locales, errors);
		validateDomain(site, htmlContents.get("index.html"), errors);
		validateBindings(site, locales[0][1], htmlContents, errors);
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
