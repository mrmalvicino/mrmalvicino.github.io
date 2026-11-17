import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadSiteData } from "../tools/site-data.mjs";
import { validateSite } from "../tools/validate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function createValidFixture() {
	const fixture = await mkdtemp(path.join(os.tmpdir(), "portfolio-validation-"));

	const requiredPaths = [
		"CNAME",
		"schemas",
		"src"
	];

	for (const relativePath of requiredPaths) {
		await cp(path.join(root, relativePath), path.join(fixture, relativePath), { recursive: true });
	}

	return fixture;
}

test("site data and local references are valid", async () => {
	const result = await validateSite(root);
	assert.deepEqual(result, { jsonFiles: 3 });
});

test("validation reports malformed JSON and missing data files", async () => {
	const fixture = await mkdtemp(path.join(os.tmpdir(), "portfolio-validation-"));

	try {
		await mkdir(path.join(fixture, "src/data"), { recursive: true });
		await writeFile(path.join(fixture, "src/data", "site.json"), "{ invalid", "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /site\.json: invalid JSON/);
				assert.match(error.message, /en\.json: required data file is missing/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("validation reports missing schemas and incomplete data without uncaught errors", async () => {
	const fixture = await createValidFixture();

	try {
		await rm(path.join(fixture, "schemas", "common.schema.json"));
		await writeFile(path.join(fixture, "src/data", "site.json"), JSON.stringify({ profile: {} }), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /common\.schema\.json: required JSON file is missing/);
				assert.match(error.message, /Data translation validation could not be completed/);
				assert.doesNotMatch(error.message, /^TypeError:/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("validation reports schema, identity, translation, and typed-reference errors", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data", "site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));
		site.projects[1].id = site.projects[0].id;
		site.projects[1].order = site.projects[0].order;
		site.projects[0].typeIds = ["unknown-type", "unknown-type"];
		site.projects[0].participationModeId = "unknown-participation-mode";
		site.projects[0].technologyIds[0] = "unknown-technology";
		site.skills.groups[0].categories[0].technologyIds[0] = "unknown-skill-technology";
		site.studies[0].type = "invalid";
		site.studies[1].institutionId = "unknown-institution";
		site.technologies.cpp.imageId = "untref-img";
		site.images.projectImages["cpp-img"] = site.images.technologyImages["cpp-img"];
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		const spanishPath = path.join(fixture, "src/data", "es.json");
		const spanish = JSON.parse(await readFile(spanishPath, "utf8"));
		delete spanish.jobs["programming-2-teaching-assistant-utn"].description;
		delete spanish.projects.membriana;
		delete spanish.projectTypes.notes;
		delete spanish.participationModes.employment;
		delete spanish.technologies.cpp;
		delete spanish.institutions.utn;
		await writeFile(spanishPath, JSON.stringify(spanish, null, 2), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /es\.json: schema violation: .*required property 'description'/);
				assert.match(error.message, /site\.json: schema violation: .*must be equal to one of the allowed values/);
				assert.match(error.message, /site\.json: schema violation: .*must NOT have duplicate items/);
				assert.match(error.message, /site\.json: duplicate id in projects: membriana/);
				assert.match(error.message, /site\.json: duplicate order in projects: 1/);
				assert.match(error.message, /site\.json: duplicate id in projectImages: cpp-img/);
				assert.match(error.message, /es\.json projects: translation keys do not match domain ids/);
				assert.match(error.message, /es\.json projectTypes: translation keys do not match domain ids/);
				assert.match(error.message, /es\.json participationModes: translation keys do not match domain ids/);
				assert.match(error.message, /es\.json technologies: translation keys do not match domain ids/);
				assert.match(error.message, /es\.json institutions: translation keys do not match domain ids/);
				assert.match(error.message, /site\.json: unknown project technology id: unknown-technology/);
				assert.match(error.message, /site\.json: unknown skill technology id: unknown-skill-technology/);
				assert.match(error.message, /site\.json: unknown project type id: unknown-type/);
				assert.match(error.message, /site\.json: unknown project participation mode id: unknown-participation-mode/);
				assert.match(error.message, /site\.json: unknown study institution id: unknown-institution/);
				assert.match(error.message, /site\.json: unknown technology image id for cpp: untref-img/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("rendering order does not depend on array position", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data", "site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));
		site.menu.reverse();
		site.projects.reverse();
		site.skills.groups.reverse();
		site.skills.groups.forEach(group => group.categories?.reverse());
		site.studies.reverse();
		site.jobs.reverse();
		site.profile.socials.reverse();
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		await validateSite(fixture);
		const data = await loadSiteData(fixture, "en");

		for (const collection of [data.menuItems, data.projects, data.skillGroups, data.studies, data.jobs, data.socials]) {
			assert.deepEqual(collection.map(item => item.order), [...collection].map(item => item.order).sort((a, b) => a - b));
		}

		for (const group of data.skillGroups.filter(group => group.categories)) {
			assert.deepEqual(
				group.categories.map(category => category.order),
				[...group.categories].map(category => category.order).sort((a, b) => a - b)
			);
		}
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("validation reports duplicate SEO metadata and an invalid site origin", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data", "site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));
		site.profile.website.href = "http://mrmalvicino.com/portfolio";
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		const englishPath = path.join(fixture, "src/data", "en.json");
		const english = JSON.parse(await readFile(englishPath, "utf8"));
		english.seo.projects.title = english.seo.index.title;
		english.seo.projects.description = english.seo.index.description;
		await writeFile(englishPath, JSON.stringify(english, null, 2), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /profile website must be an HTTPS origin URL/);
				assert.match(error.message, /duplicate SEO title for projects/);
				assert.match(error.message, /duplicate SEO description for projects/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("validation rejects an unsafe contact form endpoint", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data", "site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));
		site.configuration.formAction = "http://formspree.io/f/example";
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		await assert.rejects(validateSite(fixture), /contact form action must use HTTPS/);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("validation rejects unsafe URLs, impossible dates, and inverted periods", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data", "site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));
		site.projects[0].sourceCode = "javascript:alert(1)";
		site.studies[1].graduationDate = "2025-02-29";
		site.jobs[0].startDate = "2026-02-31";
		site.jobs[1].startDate = "2026-01";
		site.jobs[1].endDate = "2025-12";
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /unsupported URL protocol: javascript:/);
				assert.match(error.message, /invalid graduation date/);
				assert.match(error.message, /invalid start date/);
				assert.match(error.message, /end date precedes start date/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("validation enforces configured CV skills and the default project image", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data", "site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));
		site.skills.cvGroupId = "learning";
		site.images.defaultProjectImageId = "missing-image";
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /CV skill group must contain categories: learning/);
				assert.match(error.message, /unknown default project image id: missing-image/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});
