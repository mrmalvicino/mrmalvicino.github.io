import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { languages, outputFile, pages, publicScripts, route } from "../tools/site-manifest.mjs";
import { startStaticServer } from "../tools/static-server.mjs";

test("site manifest defines unique and complete publication contracts", () => {
	assert.equal(new Set(languages.map(language => language.id)).size, languages.length);
	assert.equal(new Set(languages.map(language => language.resumeFile)).size, languages.length);
	assert.equal(new Set(pages.map(page => page.id)).size, pages.length);
	assert.equal(pages.filter(page => page.path === "").length, 1);
	assert.equal(new Set(publicScripts).size, publicScripts.length);

	for (const language of languages) {
		for (const page of pages) {
			assert.match(route(language.id, page.id), new RegExp(`^/${language.id}/`));
			assert.match(outputFile(language.id, page.id), /index\.html$/);
		}
	}
});

test("shared static server handles files, methods, and invalid paths", async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), "portfolio-server-"));

	try {
		await mkdir(path.join(root, "nested"));
		await writeFile(path.join(root, "index.html"), "home", "utf8");
		await writeFile(path.join(root, "nested/index.html"), "nested", "utf8");
		await writeFile(path.join(root, "asset.pdf"), "%PDF-test", "utf8");
		const server = await startStaticServer({ root });

		try {
			const home = await fetch(`${server.baseUrl}/`);
			const nested = await fetch(`${server.baseUrl}/nested/`, { method: "HEAD" });
			const pdf = await fetch(`${server.baseUrl}/asset.pdf`);
			const missing = await fetch(`${server.baseUrl}/missing`);
			const unsupported = await fetch(`${server.baseUrl}/`, { method: "POST" });

			assert.equal(await home.text(), "home");
			assert.equal(nested.status, 200);
			assert.equal(await nested.text(), "");
			assert.equal(pdf.headers.get("content-type"), "application/pdf");
			assert.equal(missing.status, 404);
			assert.equal(unsupported.status, 405);
		} finally {
			await server.close();
		}
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});
