import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadSiteData } from "../tools/site-data.mjs";
import { validateSite } from "../tools/validate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function createValidFixture() {
	const fixture = await mkdtemp(path.join(os.tmpdir(), "portfolio-validation-"));

	for (const relativePath of ["CNAME", "schemas", "src"]) {
		await cp(path.join(root, relativePath), path.join(fixture, relativePath), { recursive: true });
	}

	return fixture;
}

test("site data and local references are valid", async () => {
	assert.deepEqual(await validateSite(root), { jsonFiles: 3 });
});

test("validation rejects inconsistent identities, translations, and typed references", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data/site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));

		site.projects[1].id = site.projects[0].id;
		site.projects[1].order = site.projects[0].order;
		site.projects[0].technologyIds[0] = "unknown-technology";
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		const spanishPath = path.join(fixture, "src/data/es.json");
		const spanish = JSON.parse(await readFile(spanishPath, "utf8"));

		delete spanish.projects.membriana;
		delete spanish.skills.items.autonomy;
		await writeFile(spanishPath, JSON.stringify(spanish, null, 2), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /duplicate id in projects/);
				assert.match(error.message, /duplicate order in projects/);
				assert.match(error.message, /projects: translation keys do not match domain ids/);
				assert.match(error.message, /skills.items: translation keys do not match domain ids/);
				assert.match(error.message, /unknown project technology id/);
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
		const sitePath = path.join(fixture, "src/data/site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));

		site.menu.reverse();
		site.professionalProfiles.reverse();
		site.projects.reverse();
		site.skills.groups.reverse();
		site.skills.groups.forEach(group => group.categories?.reverse());
		site.studies.reverse();
		site.jobs.reverse();
		site.profile.socials.reverse();
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		await validateSite(fixture);
		const data = await loadSiteData(fixture, "en");

		for (const collection of [data.menuItems, data.professionalProfiles, data.projects, data.skillGroups, data.studies, data.jobs, data.socials]) {
			assert.deepEqual(collection.map(item => item.order), [...collection].map(item => item.order).sort((a, b) => a - b));
		}
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("validation rejects unsafe runtime configuration, URLs, and dates", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data/site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));

		site.configuration.formAction = "http://formspree.io/f/example";
		site.projects[0].sourceCode = "javascript:alert(1)";
		site.studies[1].graduationDate = "2025-02-29";
		site.jobs[1].startDate = "2026-01";
		site.jobs[1].endDate = "2025-12";
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /contact form action must use HTTPS/);
				assert.match(error.message, /unsupported URL protocol: javascript:/);
				assert.match(error.message, /invalid graduation date/);
				assert.match(error.message, /end date precedes start date/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});

test("validation enforces professional profile integrity", async () => {
	const fixture = await createValidFixture();

	try {
		const sitePath = path.join(fixture, "src/data/site.json");
		const site = JSON.parse(await readFile(sitePath, "utf8"));

		site.skills.groups[0].cvProfiles = [999];
		site.professionalProfiles[1].default = true;
		await writeFile(sitePath, JSON.stringify(site, null, 2), "utf8");

		await assert.rejects(
			validateSite(fixture),
			error => {
				assert.match(error.message, /exactly one professional profile must be the default/);
				assert.match(error.message, /unknown professional profile id/);
				return true;
			}
		);
	} finally {
		await rm(fixture, { recursive: true, force: true });
	}
});
