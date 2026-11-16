import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const generatedDocuments = [
	{ language: "es", fileName: "malvicino-es.pdf" },
	{ language: "en", fileName: "malvicino-en.pdf" }
];

const contentTypes = new Map([
	[".css", "text/css; charset=utf-8"],
	[".html", "text/html; charset=utf-8"],
	[".ico", "image/x-icon"],
	[".js", "text/javascript; charset=utf-8"],
	[".jpeg", "image/jpeg"],
	[".jpg", "image/jpeg"],
	[".png", "image/png"],
	[".svg", "image/svg+xml"],
	[".webp", "image/webp"]
]);

function normalizeText(value) {
	return value.replace(/\s+/g, " ").trim();
}

function resolveRequestPath(output, requestUrl) {
	const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
	const requestedPath = path.resolve(output, pathname.replace(/^\/+/, ""));
	const filePath = pathname.endsWith("/") ? path.join(requestedPath, "index.html") : requestedPath;
	const relativePath = path.relative(output, filePath);

	if (relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
		return null;
	}

	return filePath;
}

async function startStaticServer(output) {
	const server = http.createServer(async (request, response) => {
		if (request.method !== "GET") {
			response.writeHead(405).end();
			return;
		}

		let filePath;

		try {
			filePath = resolveRequestPath(output, request.url ?? "/");
		} catch {
			response.writeHead(400).end();
			return;
		}

		if (filePath === null) {
			response.writeHead(403).end();
			return;
		}

		try {
			const fileStats = await stat(filePath);

			if (!fileStats.isFile()) {
				response.writeHead(404).end();
				return;
			}

			const contentType = contentTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";
			response.writeHead(200, { "Content-Type": contentType });
			response.end(await readFile(filePath));
		} catch {
			response.writeHead(404).end();
		}
	});

	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});

	const address = server.address();

	if (address === null || typeof address === "string") {
		throw new Error("PDF server did not expose a TCP port.");
	}

	return {
		baseUrl: `http://127.0.0.1:${address.port}`,
		close: () => new Promise((resolve, reject) => {
			server.close(error => error ? reject(error) : resolve());
		})
	};
}

async function readPdf(pdfBuffer) {
	const document = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
	const pages = [];
	const links = [];

	try {
		for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
			const page = await document.getPage(pageNumber);
			const textContent = await page.getTextContent();
			const annotations = await page.getAnnotations({ intent: "display" });

			pages.push({
				text: normalizeText(textContent.items.map(item => item.str).join("")),
				width: page.view[2] - page.view[0],
				height: page.view[3] - page.view[1]
			});

			for (const annotation of annotations) {
				if (annotation.subtype === "Link" && annotation.url) {
					links.push(annotation.url);
				}
			}
		}
	} finally {
		await document.destroy();
	}

	return { pages, links };
}

function assertPdfIntegrity(pdf, expected, fileName) {
	if (pdf.pages.length === 0) {
		throw new Error(`${fileName}: PDF does not contain pages.`);
	}

	for (const [index, page] of pdf.pages.entries()) {
		if (Math.abs(page.width - 595.28) > 1 || Math.abs(page.height - 841.89) > 1) {
			throw new Error(`${fileName}: page ${index + 1} is not A4.`);
		}

		if (!page.text) {
			throw new Error(`${fileName}: page ${index + 1} does not contain extractable text.`);
		}
	}

	const extractedText = normalizeText(pdf.pages.map(page => page.text).join(" "));

	for (const value of [expected.name, ...expected.contactText]) {
		if (!extractedText.includes(normalizeText(value))) {
			throw new Error(`${fileName}: expected extractable text is missing: ${value}`);
		}
	}

	let previousHeadingIndex = -1;

	for (const heading of expected.headings) {
		const headingIndex = extractedText.indexOf(normalizeText(heading));

		if (headingIndex <= previousHeadingIndex) {
			throw new Error(`${fileName}: section order is invalid at: ${heading}`);
		}

		previousHeadingIndex = headingIndex;
	}

	if (/[\uE000-\uF8FF\uFFFD]/u.test(extractedText)) {
		throw new Error(`${fileName}: extracted text contains an unsupported decorative character.`);
	}

	for (const expectedLink of expected.links) {
		if (!pdf.links.some(link => link === expectedLink)) {
			throw new Error(`${fileName}: expected link is missing: ${expectedLink}`);
		}
	}
}

async function generateDocument(browser, baseUrl, output, document) {
	const page = await browser.newPage();
	const localFailures = [];
	const documentUrl = `${baseUrl}/${document.language}/cv/`;

	page.on("requestfailed", request => {
		if (request.url().startsWith(baseUrl)) {
			localFailures.push(`${request.url()}: ${request.failure()?.errorText ?? "request failed"}`);
		}
	});

	page.on("response", response => {
		if (response.url().startsWith(baseUrl) && !response.ok()) {
			localFailures.push(`${response.url()}: HTTP ${response.status()}`);
		}
	});

	await page.route("**/*", route => {
		if (route.request().url().startsWith(baseUrl)) {
			return route.continue();
		}

		return route.abort("blockedbyclient");
	});

	try {
		await page.goto(documentUrl, { waitUntil: "networkidle" });
		await page.evaluate(() => document.fonts.ready);

		if (localFailures.length > 0) {
			throw new Error(`${document.fileName}: local resource loading failed:\n- ${localFailures.join("\n- ")}`);
		}

		const expected = await page.evaluate(() => {
			const text = selector => [...document.querySelectorAll(selector)]
				.map(element => element.textContent.replace(/\s+/g, " ").trim());

			const links = [...document.querySelectorAll(".cv-contact a, #projectsLst a")]
				.map(link => link.href);

			return {
				name: document.querySelector(".cv-heading h1")?.textContent ?? "",
				contactText: text(".cv-contact a"),
				headings: text(".cv-main > .cv-section > h2"),
				links
			};
		});

		if (!expected.name || expected.contactText.length < 5 || expected.headings.length !== 5) {
			throw new Error(`${document.fileName}: required resume content is incomplete.`);
		}

		const pdfBuffer = await page.pdf({
			format: "A4",
			margin: { top: "14mm", right: "14mm", bottom: "14mm", left: "14mm" },
			preferCSSPageSize: true,
			printBackground: true
		});

		const pdf = await readPdf(pdfBuffer);

		assertPdfIntegrity(pdf, expected, document.fileName);
		await writeFile(path.join(output, "assets/cv", document.fileName), pdfBuffer);

		return { fileName: document.fileName, pages: pdf.pages.length };
	} finally {
		await page.close();
	}
}

export async function generateResumePdfs(output = path.join(projectRoot, "dist")) {
	for (const document of generatedDocuments) {
		await stat(path.join(output, document.language, "cv/index.html"));
	}

	await mkdir(path.join(output, "assets/cv"), { recursive: true });

	const server = await startStaticServer(output);
	let browser;

	try {
		browser = await chromium.launch();
		const results = [];

		for (const document of generatedDocuments) {
			results.push(await generateDocument(browser, server.baseUrl, output, document));
		}

		return results;
	} finally {
		try {
			await browser?.close();
		} finally {
			await server.close();
		}
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(projectRoot, "dist");
	const results = await generateResumePdfs(output);

	for (const result of results) {
		console.log(`Generated ${result.fileName} (${result.pages} pages).`);
	}
}
