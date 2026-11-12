import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
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

test("validation reports schema, identity, translation, and typed-reference errors", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data", "site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));
		site.projects[1].id = site.projects[0].id;
		site.projects[1].order = site.projects[0].order;
		site.projects[0].technologyIds[0] = "unknown-technology";
		site.studies[0].type = "invalid";
		site.studies[1].institutionId = "unknown-institution";
		site.technologies.cpp.imageId = "untrefImg";
		site.images.projects_images.cppImg = site.images.technologies_images.cppImg;
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		const spanishPath = path.join(fixture, "src/data", "es.json");
		const spanish = JSON.parse(await readFile(spanishPath, "utf8"));
		delete spanish.jobs["programming-2-teaching-assistant-utn"].description;
		delete spanish.projects.membriana;
		delete spanish.technologies.cpp;
		delete spanish.institutions.utn;
		await writeFile(spanishPath, JSON.stringify(spanish, null, 2), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /es\.json: schema violation: .*required property 'description'/);
				assert.match(error.message, /site\.json: schema violation: .*must be equal to one of the allowed values/);
				assert.match(error.message, /site\.json: duplicate id in projects: meeni-erp/);
				assert.match(error.message, /site\.json: duplicate order in projects: 1/);
				assert.match(error.message, /site\.json: duplicate id in projects_images: cppImg/);
				assert.match(error.message, /es\.json projects: translation keys do not match domain ids/);
				assert.match(error.message, /es\.json technologies: translation keys do not match domain ids/);
				assert.match(error.message, /es\.json institutions: translation keys do not match domain ids/);
				assert.match(error.message, /site\.json: unknown project technology id: unknown-technology/);
				assert.match(error.message, /site\.json: unknown study institution id: unknown-institution/);
				assert.match(error.message, /site\.json: unknown technology image id for cpp: untrefImg/);
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
		site.jobs.reverse();
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		await validateSite(fixture);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});
