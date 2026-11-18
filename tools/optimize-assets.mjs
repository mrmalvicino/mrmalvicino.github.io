import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { listFiles } from "./filesystem.mjs";
import { pages } from "./site-manifest.mjs";

const toolRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rasterExtensions = new Set([".jpeg", ".jpg", ".png"]);
const iconNames = [
	"arrow-left-short",
	"award",
	"code-slash",
	"download",
	"envelope",
	"eye",
	"filter-circle",
	"geo-alt",
	"github",
	"globe2",
	"linkedin",
	"list",
	"mortarboard",
	"plus-circle",
	"telegram",
	"telephone",
	"translate",
	"whatsapp",
	"x-lg"
];
const fontFiles = [
	{
		source: "node_modules/@fontsource/jost/files/jost-latin-300-normal.woff2",
		destination: "jost-latin-300-normal.woff2"
	},
	{
		source: "node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2",
		destination: "open-sans-latin-wght-normal.woff2"
	},
	{
		source: "node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff2",
		destination: "bootstrap-icons.woff2"
	}
];
const licenseFiles = [
	{ source: "node_modules/@fontsource/jost/LICENSE", destination: "jost.txt" },
	{ source: "node_modules/@fontsource-variable/open-sans/LICENSE", destination: "open-sans.txt" },
	{ source: "node_modules/bootstrap-icons/LICENSE", destination: "bootstrap-icons.txt" }
];

function renderFontStyles() {
	return `@font-face {
	font-family: "Jost";
	font-style: normal;
	font-display: swap;
	font-weight: 300;
	src: url("/assets/fonts/jost-latin-300-normal.woff2") format("woff2");
}

@font-face {
	font-family: "Open Sans";
	font-style: normal;
	font-display: swap;
	font-weight: 300 800;
	src: url("/assets/fonts/open-sans-latin-wght-normal.woff2") format("woff2-variations");
}`;
}

async function renderIconStyles() {
	const source = await readFile(path.join(toolRoot, "node_modules/bootstrap-icons/font/bootstrap-icons.css"), "utf8");
	const rules = iconNames.map(name => {
		const match = source.match(new RegExp(`\\.bi-${name}::before \\{ content: "([^"]+)"; \\}`));

		if (!match) {
			throw new Error(`Bootstrap icon is missing: ${name}`);
		}

		return `.bi-${name}::before { content: "${match[1]}"; }`;
	}).join("\n");

	return `@font-face {
	font-display: block;
	font-family: "bootstrap-icons";
	src: url("/assets/fonts/bootstrap-icons.woff2") format("woff2");
}

.bi::before,
[class^="bi-"]::before,
[class*=" bi-"]::before {
	display: inline-block;
	font-family: "bootstrap-icons" !important;
	font-style: normal;
	font-weight: normal !important;
	font-variant: normal;
	line-height: 1;
	text-transform: none;
	vertical-align: -0.125em;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

${rules}`;
}

async function generateStyleBundles(root, output) {
	const bundleDirectory = path.join(output, "style/bundles");
	const vendorStyles = `${renderFontStyles()}\n\n${await renderIconStyles()}`;

	await mkdir(bundleDirectory, { recursive: true });

	for (const page of pages) {
		const styles = await Promise.all(page.styles.map(async file => {
			const contents = await readFile(path.join(root, "src/style", file), "utf8");

			return `/* ${file} */\n${contents.trim()}`;
		}));

		await writeFile(path.join(bundleDirectory, `${page.id}.css`), `${vendorStyles}\n\n${styles.join("\n\n")}\n`, "utf8");
	}
}

async function copyVendorFiles(root, output) {
	const fontDirectory = path.join(output, "assets/fonts");
	const licenseDirectory = path.join(output, "assets/licenses");

	await Promise.all([
		mkdir(fontDirectory, { recursive: true }),
		mkdir(licenseDirectory, { recursive: true })
	]);

	await Promise.all([
		...fontFiles.map(file => cp(path.join(toolRoot, file.source), path.join(fontDirectory, file.destination))),
		...licenseFiles.map(file => cp(path.join(toolRoot, file.source), path.join(licenseDirectory, file.destination)))
	]);
}

async function generateWebpImages(root, output) {
	const sourceDirectory = path.join(root, "src/assets/images");
	const files = (await listFiles(sourceDirectory)).map(file => path.join(sourceDirectory, file));

	await Promise.all(files.filter(file => {
		const relativePath = path.relative(sourceDirectory, file);

		return !relativePath.startsWith(`social${path.sep}`) && rasterExtensions.has(path.extname(file).toLowerCase());
	}).map(async file => {
		const relativePath = path.relative(sourceDirectory, file);
		const destination = path.join(output, "assets/images", relativePath.replace(/\.(?:jpe?g|png)$/i, ".webp"));
		let pipeline = sharp(file).rotate();

		if (relativePath === "profile.png") {
			pipeline = pipeline.resize(500, 500, { fit: "cover" });
		}

		await mkdir(path.dirname(destination), { recursive: true });
		await pipeline.webp({ quality: 82, alphaQuality: 90, effort: 5 }).toFile(destination);
	}));
}

async function copyPublicAssets(root, output) {
	const sourceImages = path.join(root, "src/assets/images");
	const outputImages = path.join(output, "assets/images");

	await Promise.all([
		cp(sourceImages, outputImages, {
			recursive: true,
			filter: sourcePath => {
				const relativePath = path.relative(sourceImages, sourcePath);

				return path.basename(sourcePath) !== ".DS_Store" &&
					(relativePath.startsWith(`social${path.sep}`) || !rasterExtensions.has(path.extname(sourcePath).toLowerCase()));
			}
		}),
		cp(path.join(root, "src/assets/documents"), path.join(output, "assets/documents"), {
			recursive: true,
			filter: sourcePath => path.basename(sourcePath) !== ".DS_Store"
		})
	]);
}

export async function optimizeAssets(root, output) {
	await copyPublicAssets(root, output);

	await Promise.all([
		generateStyleBundles(root, output),
		copyVendorFiles(root, output),
		generateWebpImages(root, output)
	]);
}
