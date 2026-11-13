import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv from "ajv";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["en", "es"];
const dataFiles = ["site.json", ...languages.map(language => `${language}.json`)];
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
		actualFiles = (await readdir(path.join(root, "src/data"))).filter(fileName => fileName.endsWith(".json")).sort();
	} catch {
		errors.push("src/data/: directory does not exist");
		return data;
	}

	for (const fileName of dataFiles) {
		if (!actualFiles.includes(fileName)) {
			errors.push(`src/data/${fileName}: required data file is missing`);
			continue;
		}

		data.set(fileName, await readJson(root, `src/data/${fileName}`, errors));
	}

	for (const fileName of actualFiles) {
		if (!dataFiles.includes(fileName)) {
			errors.push(`src/data/${fileName}: obsolete or unsupported data file`);
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
				errors.push(`src/data/${fileName}: schema violation: ${formatSchemaError(error)}`);
			}
		}
	}
}

function validateUniqueCollection(items, collection, errors, globalIds = null) {
	const ids = new Set();
	const orders = new Set();

	for (const item of items ?? []) {
		if (ids.has(item.id) || globalIds?.has(item.id)) {
			errors.push(`src/data/site.json: duplicate id in ${collection}: ${item.id}`);
		}

		ids.add(item.id);
		globalIds?.add(item.id);

		if (item.order !== undefined) {
			if (orders.has(item.order)) {
				errors.push(`src/data/site.json: duplicate order in ${collection}: ${item.order}`);
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

function validateTranslations(site, locales, errors) {
	const imageIds = Object.values(site.images).flatMap(images => Object.keys(images));
	const technologyImageIds = new Set(Object.values(site.technologies).map(technology => technology.imageId));
	const expected = {
		images: imageIds,
		technologies: Object.keys(site.technologies),
		projectTypes: Object.keys(site.projectTypes),
		institutions: Object.keys(site.institutions),
		menu: site.menu.map(item => item.id),
		projects: site.projects.map(item => item.id),
		studies: site.studies.map(item => item.id),
		jobs: site.jobs.map(item => item.id),
		socials: site.profile.socials.map(item => item.id),
		buttons: [site.controls.submitButtonId],
		placeholders: site.controls.textboxIds
	};

	for (const [language, locale] of locales) {
		for (const [collection, ids] of Object.entries(expected)) {
			compareKeys(locale?.[collection], ids, `src/data/${language}.json ${collection}`, errors);
		}

		for (const [group, ids] of Object.entries(site.controls.labelIds)) {
			compareKeys(locale?.labels?.[group], ids, `src/data/${language}.json labels.${group}`, errors);
		}

		for (const imageId of imageIds) {
			if (!locale.images[imageId]?.title && !technologyImageIds.has(imageId)) {
				errors.push(`src/data/${language}.json images: missing title for ${imageId}`);
			}
		}

		compareKeys(
			locale.skills.groups,
			site.skills.groups.map(group => group.id),
			`src/data/${language}.json skills.groups`,
			errors
		);

		compareKeys(
			locale.skills.categories,
			new Set(site.skills.groups.flatMap(group => group.categories?.map(category => category.id) ?? [])),
			`src/data/${language}.json skills.categories`,
			errors
		);
	}
}

function validateDomain(site, errors) {
	const collections = {
		menu: site.menu,
		projects: site.projects,
		skillGroups: site.skills.groups,
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
				errors.push(`src/data/site.json: duplicate id in ${name}: ${id}`);
			}

			allImageIds.add(id);
		}
	}

	const technologyIds = new Set(Object.keys(site.images.technologies_images));
	const institutionIds = new Set(Object.keys(site.images.institutions_images));
	const projectImageIds = new Set(Object.keys(site.images.projects_images));
	const technologyEntityIds = new Set(Object.keys(site.technologies));
	const projectTypeIds = new Set(Object.keys(site.projectTypes));
	const institutionEntityIds = new Set(Object.keys(site.institutions));
	const referencedTechnologyImageIds = new Set();
	const referencedInstitutionImageIds = new Set();

	for (const [id, technology] of Object.entries(site.technologies)) {
		if (referencedTechnologyImageIds.has(technology.imageId)) {
			errors.push(`src/data/site.json: technology image id is reused: ${technology.imageId}`);
		}

		referencedTechnologyImageIds.add(technology.imageId);

		if (!technologyIds.has(technology.imageId)) {
			errors.push(`src/data/site.json: unknown technology image id for ${id}: ${technology.imageId}`);
		}
	}

	for (const [id, institution] of Object.entries(site.institutions)) {
		if (referencedInstitutionImageIds.has(institution.imageId)) {
			errors.push(`src/data/site.json: institution image id is reused: ${institution.imageId}`);
		}

		referencedInstitutionImageIds.add(institution.imageId);

		if (!institutionIds.has(institution.imageId)) {
			errors.push(`src/data/site.json: unknown institution image id for ${id}: ${institution.imageId}`);
		}
	}

	if (referencedTechnologyImageIds.size !== technologyIds.size) {
		errors.push("src/data/site.json: every technology image must belong to one technology");
	}

	if (referencedInstitutionImageIds.size !== institutionIds.size) {
		errors.push("src/data/site.json: every institution image must belong to one institution");
	}

	for (const group of site.skills.groups) {
		const categoryTechnologies = group.categories?.flatMap(category => category.technologyIds) ?? [];
		const technologyIds = group.technologyIds ?? categoryTechnologies;

		if (group.categories) {
			validateUniqueCollection(group.categories, `skills.${group.id}.categories`, errors);
		}

		for (const id of technologyIds) {
			if (!technologyEntityIds.has(id)) {
				errors.push(`src/data/site.json: unknown skill technology id: ${id}`);
			}
		}
	}

	for (const project of site.projects) {
		for (const id of project.typeIds) {
			if (!projectTypeIds.has(id)) {
				errors.push(`src/data/site.json: unknown project type id: ${id}`);
			}
		}

		for (const id of project.technologyIds) {
			if (!technologyEntityIds.has(id)) {
				errors.push(`src/data/site.json: unknown project technology id: ${id}`);
			}
		}

		if (project.mockup_id && !projectImageIds.has(project.mockup_id)) {
			errors.push(`src/data/site.json: unknown project image id: ${project.mockup_id}`);
		}
	}

	for (const study of site.studies) {
		if (!institutionEntityIds.has(study.institutionId)) {
			errors.push(`src/data/site.json: unknown study institution id: ${study.institutionId}`);
		}
	}

	if (!projectImageIds.has("wipImg")) {
		errors.push("src/data/site.json: required project image id is missing: wipImg");
	}

	const pageIds = new Set(["heroSec", "skillsSec", "projectsSec", "educationSec", "contactSec"]);

	for (const item of site.menu) {
		if (item.href.startsWith("#") && !pageIds.has(item.href.slice(1))) {
			errors.push(`src/data/site.json: unknown index.html fragment: ${item.href}`);
		}
	}
}

async function validateCss(root, errors) {
	let cssFiles = [];

	try {
		cssFiles = (await readdir(path.join(root, "src/style"))).filter(name => name.endsWith(".css"));
	} catch {
		errors.push("src/style/: directory does not exist");
		return;
	}

	for (const fileName of cssFiles) {
		const contents = await readFile(path.join(root, "src/style", fileName), "utf8");

		for (const match of contents.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
			await validateReference(path.join(root, "src"), match[1], `src/style/${fileName}`, errors, `style/${fileName}`);
		}
	}
}

export async function validateSite(root = projectRoot) {
	const errors = [];

	for (const requiredPath of ["CNAME", "schemas", "src/assets", "src/data", "src/script", "src/style"]) {
		if (!(await pathExists(path.join(root, requiredPath)))) {
			errors.push(`${requiredPath}: required build input is missing`);
		}
	}

	const data = await readData(root, errors);
	await validateSchemas(root, data, errors);
	await validateCss(root, errors);

	for (const [fileName, contents] of data) {
		const references = [];
		collectJsonReferences(contents, references);

		for (const reference of references) {
			await validateReference(path.join(root, "src"), reference, `src/data/${fileName}`, errors);
		}
	}

	const site = data.get("site.json");
	const locales = languages.map(language => [language, data.get(`${language}.json`)]);

	if (site && locales.every(([, locale]) => locale)) {
		validateTranslations(site, locales, errors);
		validateDomain(site, errors);
	}

	if (errors.length > 0) {
		throw new Error(`Validation failed:\n- ${errors.join("\n- ")}`);
	}

	return { jsonFiles: data.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	try {
		const result = await validateSite(projectRoot);
		console.log(`Validation passed (${result.jsonFiles} JSON files).`);
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
	}
}
