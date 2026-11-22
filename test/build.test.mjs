import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildSite } from "../tools/build.mjs";
import { languages, outputFile, pages } from "../tools/site-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function assertLocalReferencesExist(output, route, contents) {
	for (const match of contents.matchAll(/(?:href|src|action)="([^"]+)"/g)) {
		const reference = match[1].replaceAll("&amp;", "&");

		if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(reference)) {
			continue;
		}

		const url = new URL(reference, `https://local.invalid/${route}`);
		let target = path.join(output, decodeURIComponent(url.pathname));

		if (url.pathname.endsWith("/")) {
			target = path.join(target, "index.html");
		}

		await stat(target);
	}
}

test("build creates the complete static publication", async () => {
	const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "portfolio-build-"));
	const output = path.join(temporaryRoot, "dist");

	try {
		await buildSite(root, output);

		for (const language of languages) {
			await stat(path.join(output, "assets/cv", language.resumeFile));

			for (const page of pages) {
				const route = outputFile(language.id, page.id);
				const contents = await readFile(path.join(output, route), "utf8");

				assert.match(contents, new RegExp(`<html lang="${language.id}">`));
				assert.match(contents, new RegExp(`href="/style/bundles/${page.id}\\.css"`));

				for (const script of page.scripts) {
					assert.match(contents, new RegExp(`src="/script/${script.replace(".", "\\.")}"`));
				}

				assert.doesNotMatch(contents, /fetch\s*\(|\{\{|undefined/);
				assert.doesNotMatch(contents, /(?:src|href)="[^"]*data\/(?:site|es|en)\.json/);
				await assertLocalReferencesExist(output, route, contents);
			}
		}

		const cv = await readFile(path.join(output, "en/cv/index.html"), "utf8");
		const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");

		assert.match(cv, /id="cv-profile-data" type="application\/json"/);
		assert.match(cv, /data-cv-profiles="1"/);
		assert.match(cv, /data-cv-profiles="2" hidden/);
		assert.match(sitemap, /<loc>https:\/\/mrmalvicino\.com\/en\/cv\/<\/loc>/);
		await Promise.all([
			stat(path.join(output, "index.html")),
			stat(path.join(output, "projects.html")),
			stat(path.join(output, "cv.html")),
			stat(path.join(output, "CNAME")),
			stat(path.join(output, "robots.txt"))
		]);
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
