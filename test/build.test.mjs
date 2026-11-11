import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildSite } from "../tools/build.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function listFiles(directory, prefix = "") {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const relativePath = path.join(prefix, entry.name);

		if (entry.isDirectory()) {
			files.push(...await listFiles(path.join(directory, entry.name), relativePath));
		} else {
			files.push(relativePath);
		}
	}

	return files;
}

test("build creates a complete publishable artifact", async () => {
	const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "portfolio-build-"));
	const output = path.join(temporaryRoot, "dist");

	try {
		await buildSite(root, output);

		const requiredFiles = [
			"CNAME",
			"index.html",
			"projects.html",
			"cv.html",
			"footer.html",
			"style/constants.css",
			"script/utils.js",
			"data/projects-es.json",
			"data/projects-en.json",
			"assets/images/logo.png",
			"assets/cv/malvicino-es.pdf"
		];

		await Promise.all(requiredFiles.map(file => stat(path.join(output, file))));

		assert.equal(
			await readFile(path.join(output, "CNAME"), "utf8"),
			await readFile(path.join(root, "CNAME"), "utf8")
		);

		const files = await listFiles(output);
		assert.equal(files.some(file => path.basename(file) === ".DS_Store"), false);
		assert.equal(files.includes("package.json"), false);
		assert.equal(files.some(file => file.startsWith("test/")), false);
		assert.equal(files.some(file => file.startsWith("tools/")), false);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("build refuses to delete the project root", async () => {
	await assert.rejects(
		buildSite(root, root),
		/Build output cannot be the project root or one of its parent directories\./
	);

	await stat(path.join(root, "package.json"));
});
