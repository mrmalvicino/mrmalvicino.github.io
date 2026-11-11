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
		"assets",
		"data",
		"footer.html",
		"index.html",
		"projects.html",
		"cv.html",
		"schemas",
		"script",
		"style"
	];

	for (const relativePath of requiredPaths) {
		await cp(path.join(root, relativePath), path.join(fixture, relativePath), { recursive: true });
	}

	return fixture;
}

test("site data and local references are valid", async () => {
	const result = await validateSite(root);
	assert.deepEqual(result, { htmlFiles: 4, jsonFiles: 18 });
});

test("validation reports malformed JSON, missing files, and invalid local references", async () => {
	const fixture = await mkdtemp(path.join(os.tmpdir(), "portfolio-validation-"));

	try {
		await mkdir(path.join(fixture, "data"));
		await writeFile(path.join(fixture, "data", "projects-en.json"), "{ invalid", "utf8");

		await writeFile(
			path.join(fixture, "index.html"),
			'<script src="missing.js"></script><a href="%2e%2e%2fpackage.json">Invalid</a>',
			"utf8"
		);

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /projects-en\.json: invalid JSON/);
				assert.match(error.message, /projects-es\.json: required localized data file is missing/);
				assert.match(error.message, /index\.html: local reference does not exist: missing\.js/);
				assert.match(error.message, /index\.html: local reference escapes the site root: %2e%2e%2fpackage\.json/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("validation reports schema, identity, parity, and typed-reference errors", async () => {
	const fixture = await createValidFixture();

	try {
		const projectsPath = path.join(fixture, "data", "projects-en.json");
		const projects = JSON.parse(await readFile(projectsPath, "utf8"));
		projects.projects[1].id = projects.projects[0].id;
		projects.projects[1].order = projects.projects[0].order;
		projects.projects[0].technologies_ids[0] = "untrefImg";
		await writeFile(projectsPath, JSON.stringify(projects, null, 2), "utf8");

		const studiesPath = path.join(fixture, "data", "studies-en.json");
		const studies = JSON.parse(await readFile(studiesPath, "utf8"));
		studies.studies[0].type = "invalid";
		await writeFile(studiesPath, JSON.stringify(studies, null, 2), "utf8");

		const jobsPath = path.join(fixture, "data", "jobs-es.json");
		const jobs = JSON.parse(await readFile(jobsPath, "utf8"));
		delete jobs.jobs[0].description;
		await writeFile(jobsPath, JSON.stringify(jobs, null, 2), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /jobs-es\.json: schema violation: .*required property 'description'/);
				assert.match(error.message, /studies-en\.json: schema violation: .*must be equal to one of the allowed values/);
				assert.match(error.message, /projects-en\.json: duplicate id in projects: meeni-erp/);
				assert.match(error.message, /projects-en\.json: duplicate order in projects: 1/);
				assert.match(error.message, /projects-\*\.json: localized id set differs in projects/);
				assert.match(error.message, /projects-en\.json: unknown technology image id: untrefImg/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("localized correspondence and rendering order do not depend on array position", async () => {
	const fixture = await createValidFixture();

	try {
		const jobsPath = path.join(fixture, "data", "jobs-es.json");
		const jobs = JSON.parse(await readFile(jobsPath, "utf8"));
		jobs.jobs.reverse();
		await writeFile(jobsPath, JSON.stringify(jobs, null, 2), "utf8");

		await validateSite(fixture);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});
