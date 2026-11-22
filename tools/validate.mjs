import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv from "ajv";
import { languages } from "./site-manifest.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFiles = ["site.json", ...languages.map(language => `${language.id}.json`)];
const localJsonKeys = new Set([
	"certificate",
	"formAction",
	"href",
	"liveDemo",
	"socialImage",
	"sourceCode",
	"src",
	"videoUrl",
	"websiteUrl"
]);

const generatedSitePaths = new Set([
	...languages.map(language => `assets/cv/${language.resumeFile}`)
]);

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

async function generatedImageSourceExists(root, sitePath) {
	if (!sitePath.startsWith("assets/images/") || path.extname(sitePath).toLowerCase() !== ".webp") {
		return false;
	}

	const sourcePath = sitePath.slice(0, -path.extname(sitePath).length);
	const candidates = [".png", ".jpg", ".jpeg"].map(extension => path.join(root, `${sourcePath}${extension}`));

	return (await Promise.all(candidates.map(pathExists))).some(Boolean);
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

	const referenceExists = generatedSitePaths.has(sitePath) || await pathExists(target) || await generatedImageSourceExists(resolvedRoot, sitePath);

	if (!sitePath || !referenceExists) {
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
		if (error.code === "ENOENT") {
			errors.push(`${relativePath}: required JSON file is missing`);
		} else if (error instanceof SyntaxError) {
			errors.push(`${relativePath}: invalid JSON (${error.message})`);
		} else {
			errors.push(`${relativePath}: could not be read (${error.message})`);
		}

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
	const imageMaps = [
		site.images.commonImages,
		site.images.technologyImages,
		site.images.institutionImages,
		site.images.projectImages
	];
	const imageIds = imageMaps.flatMap(images => Object.keys(images));
	const technologyImageIds = new Set(Object.values(site.technologies).map(technology => technology.imageId));
	const expected = {
		professionalProfiles: site.professionalProfiles.map(item => String(item.id)),
		images: imageIds,
		technologies: Object.keys(site.technologies),
		projectTypes: Object.keys(site.projectTypes),
		participationModes: Object.keys(site.participationModes),
		institutions: Object.keys(site.institutions),
		menu: site.menu.map(item => item.id),
		projects: site.projects.map(item => item.id),
		studies: site.studies.map(item => item.id),
		jobs: site.jobs.map(item => item.id),
		socials: site.profile.socials.map(item => item.id),
		buttons: ["submitBtn"],
		placeholders: ["nameTxt", "emailTxt", "phoneTxt", "messageTxt"]
	};
	const labelIds = {
		common: ["sourceCodeLbl", "openOnlineLbl", "websiteLbl"],
		index: ["resumeLbl", "onlineResumeLbl", "skillsLbl", "projectsLbl", "allProjectsLbl", "educationLbl", "contactTitleLbl", "contactDescriptionLbl", "nameLbl", "emailLbl", "phoneLbl", "messageLbl"],
		projects: ["projectsLbl", "backLbl", "filtersLbl", "technologiesLbl", "typesLbl", "contributionsLbl", "clearFiltersLbl", "projectSingularLbl", "projectPluralLbl"],
		cv: ["profileLbl", "skillsLbl", "educationLbl", "experienceLbl", "projectsLbl", "presentLbl", "technologiesLbl"]
	};

	for (const [language, locale] of locales) {
		for (const [collection, ids] of Object.entries(expected)) {
			compareKeys(locale?.[collection], ids, `src/data/${language}.json ${collection}`, errors);
		}

		for (const [group, ids] of Object.entries(labelIds)) {
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

function validateSeo(site, locales, errors) {
	const titles = new Set();
	const descriptions = new Set();

	try {
		const websiteUrl = new URL(site.profile.website.href);

		if (websiteUrl.protocol !== "https:" || websiteUrl.pathname !== "/" || websiteUrl.search || websiteUrl.hash) {
			errors.push("src/data/site.json: profile website must be an HTTPS origin URL");
		}
	} catch {
		errors.push("src/data/site.json: profile website is not a valid URL");
	}

	for (const [language, locale] of locales) {
		for (const [page, seo] of Object.entries(locale.seo ?? {})) {
			if (typeof seo.title !== "string" || typeof seo.description !== "string") {
				continue;
			}

			if (titles.has(seo.title)) {
				errors.push(`src/data/${language}.json: duplicate SEO title for ${page}: ${seo.title}`);
			}

			if (descriptions.has(seo.description)) {
				errors.push(`src/data/${language}.json: duplicate SEO description for ${page}`);
			}

			titles.add(seo.title);
			descriptions.add(seo.description);
		}
	}
}

function validateRuntimeConfiguration(site, errors) {
	try {
		const formAction = new URL(site.configuration.formAction);

		if (formAction.protocol !== "https:") {
			errors.push("src/data/site.json: contact form action must use HTTPS");
		}
	} catch {
		errors.push("src/data/site.json: contact form action is not a valid URL");
	}
}

function validateUrl(value, source, protocols, errors) {
	try {
		const url = new URL(value);

		if (!protocols.includes(url.protocol)) {
			errors.push(`${source}: unsupported URL protocol: ${url.protocol}`);
		}
	} catch {
		errors.push(`${source}: invalid URL`);
	}
}

function validateUrls(site, errors) {
	validateUrl(site.profile.website.href, "src/data/site.json profile.website.href", ["https:"], errors);
	validateUrl(site.profile.email.href, "src/data/site.json profile.email.href", ["mailto:"], errors);
	validateUrl(site.profile.phone.href, "src/data/site.json profile.phone.href", ["tel:"], errors);
	validateUrl(site.profile.linkedin.href, "src/data/site.json profile.linkedin.href", ["https:"], errors);
	validateUrl(site.profile.location.href, "src/data/site.json profile.location.href", ["https:"], errors);
	validateUrl(site.configuration.formAction, "src/data/site.json configuration.formAction", ["https:"], errors);

	for (const social of site.profile.socials) {
		validateUrl(social.href, `src/data/site.json profile.socials.${social.id}.href`, ["https:"], errors);
	}

	const localOrHttpsReferences = [
		[site.configuration.socialImage, "configuration.socialImage"],
		...Object.entries(site.resumes).map(([language, resume]) => [resume.href, `resumes.${language}.href`]),
		...[
			site.images.commonImages,
			site.images.technologyImages,
			site.images.institutionImages,
			site.images.projectImages
		].flatMap(images => Object.entries(images).map(([id, image]) => [image.src, `images.${id}.src`])),
		...site.studies.flatMap(study => [
			[study.studyPlan, `studies.${study.id}.studyPlan`],
			[study.certificate, `studies.${study.id}.certificate`]
		])
	];

	for (const [reference, source] of localOrHttpsReferences) {
		if (reference && isExternalReference(reference)) {
			validateUrl(reference, `src/data/site.json ${source}`, ["https:"], errors);
		}
	}

	for (const project of site.projects) {
		for (const field of ["sourceCode", "liveDemo", "websiteUrl", "videoUrl"]) {
			if (project[field]) {
				validateUrl(project[field], `src/data/site.json projects.${project.id}.${field}`, ["https:"], errors);
			}
		}
	}

	if (site.profile.email.href !== `mailto:${site.profile.email.address}`) {
		errors.push("src/data/site.json: profile email href must match its address");
	}
}

function parseDate(value) {
	const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);

	if (!match) {
		return null;
	}

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3] ?? "1");
	const date = new Date(Date.UTC(year, month - 1, day));

	if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
		return null;
	}

	return date.getTime();
}

function validateDates(site, errors) {
	for (const study of site.studies) {
		if (study.graduationDate && parseDate(study.graduationDate) === null) {
			errors.push(`src/data/site.json: invalid graduation date for ${study.id}: ${study.graduationDate}`);
		}
	}

	for (const job of site.jobs) {
		const start = parseDate(job.startDate);
		const end = job.endDate ? parseDate(job.endDate) : null;

		if (start === null) {
			errors.push(`src/data/site.json: invalid start date for ${job.id}: ${job.startDate}`);
		}

		if (job.endDate && end === null) {
			errors.push(`src/data/site.json: invalid end date for ${job.id}: ${job.endDate}`);
		}

		if (start !== null && end !== null && end < start) {
			errors.push(`src/data/site.json: end date precedes start date for ${job.id}`);
		}
	}
}

function validateDomain(site, errors) {
	const collections = {
		professionalProfiles: site.professionalProfiles,
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
	const imageMaps = {
		commonImages: site.images.commonImages,
		technologyImages: site.images.technologyImages,
		institutionImages: site.images.institutionImages,
		projectImages: site.images.projectImages
	};

	for (const [name, images] of Object.entries(imageMaps)) {
		for (const id of Object.keys(images)) {
			if (allImageIds.has(id)) {
				errors.push(`src/data/site.json: duplicate id in ${name}: ${id}`);
			}

			allImageIds.add(id);
		}
	}

	const technologyIds = new Set(Object.keys(site.images.technologyImages));
	const institutionIds = new Set(Object.keys(site.images.institutionImages));
	const projectImageIds = new Set(Object.keys(site.images.projectImages));
	const technologyEntityIds = new Set(Object.keys(site.technologies));
	const projectTypeIds = new Set(Object.keys(site.projectTypes));
	const participationModeIds = new Set(Object.keys(site.participationModes));
	const institutionEntityIds = new Set(Object.keys(site.institutions));
	const professionalProfileIds = new Set(site.professionalProfiles.map(profile => profile.id));
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
		if (!participationModeIds.has(project.participationModeId)) {
			errors.push(`src/data/site.json: unknown project participation mode id: ${project.participationModeId}`);
		}

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

		if (project.mockupId && !projectImageIds.has(project.mockupId)) {
			errors.push(`src/data/site.json: unknown project image id: ${project.mockupId}`);
		}
	}

	for (const job of site.jobs) {
		for (const id of job.technologyIds ?? []) {
			if (!technologyEntityIds.has(id)) {
				errors.push(`src/data/site.json: unknown job technology id: ${id}`);
			}
		}
	}

	for (const study of site.studies) {
		if (!institutionEntityIds.has(study.institutionId)) {
			errors.push(`src/data/site.json: unknown study institution id: ${study.institutionId}`);
		}
	}

	if (!projectImageIds.has(site.images.defaultProjectImageId)) {
		errors.push(`src/data/site.json: unknown default project image id: ${site.images.defaultProjectImageId}`);
	}

	const defaultProfiles = site.professionalProfiles.filter(profile => profile.default);

	if (defaultProfiles.length !== 1) {
		errors.push("src/data/site.json: exactly one professional profile must be the default");
	}

	const cvCollections = {
		projects: site.projects,
		skillGroups: site.skills.groups,
		studies: site.studies,
		jobs: site.jobs
	};

	for (const [collection, items] of Object.entries(cvCollections)) {
		for (const item of items) {
			for (const profileId of item.cvProfiles) {
				if (!professionalProfileIds.has(profileId)) {
					errors.push(`src/data/site.json: unknown professional profile id in ${collection}.${item.id}: ${profileId}`);
				}
			}
		}
	}

	const pageIds = new Set(["hero-sec", "skills-sec", "projects-sec", "education-sec", "contact-sec"]);

	for (const item of site.menu) {
		if (item.href.startsWith("#") && !pageIds.has(item.href.slice(1))) {
			errors.push(`src/data/site.json: unknown index.html fragment: ${item.href}`);
		}
	}
}

function runSemanticValidation(name, validation, errors) {
	try {
		validation();
	} catch (error) {
		errors.push(`Data ${name} validation could not be completed (${error.message})`);
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

		if (fileName === "site.json" && contents?.studies) {
			references.push(...contents.studies.map(study => study.studyPlan).filter(Boolean));
		}

		for (const reference of references) {
			await validateReference(path.join(root, "src"), reference, `src/data/${fileName}`, errors);
		}
	}

	const site = data.get("site.json");
	const locales = languages.map(language => [language.id, data.get(`${language.id}.json`)]);

	if (site && locales.every(([, locale]) => locale)) {
		runSemanticValidation("translation", () => validateTranslations(site, locales, errors), errors);
		runSemanticValidation("domain", () => validateDomain(site, errors), errors);
		runSemanticValidation("SEO", () => validateSeo(site, locales, errors), errors);
		runSemanticValidation("runtime configuration", () => validateRuntimeConfiguration(site, errors), errors);
		runSemanticValidation("URLs", () => validateUrls(site, errors), errors);
		runSemanticValidation("dates", () => validateDates(site, errors), errors);
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
