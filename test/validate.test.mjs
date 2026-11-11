import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateSite } from "../tools/validate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
