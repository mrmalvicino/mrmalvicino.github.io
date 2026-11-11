import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const publishPaths = [
	"CNAME",
	"index.html",
	"projects.html",
	"cv.html",
	"footer.html",
	"assets",
	"data",
	"script",
	"style"
];

function isSameOrParent(parent, candidate) {
	const relativePath = path.relative(parent, candidate);

	return relativePath === "" || (
		relativePath !== ".." &&
		!relativePath.startsWith(`..${path.sep}`) &&
		!path.isAbsolute(relativePath)
	);
}

function validateOutputPath(root, output) {
	const resolvedRoot = path.resolve(root);
	const resolvedOutput = path.resolve(output);
	const defaultOutput = path.join(resolvedRoot, "dist");

	if (isSameOrParent(resolvedOutput, resolvedRoot)) {
		throw new Error("Build output cannot be the project root or one of its parent directories.");
	}

	if (isSameOrParent(resolvedRoot, resolvedOutput) && resolvedOutput !== defaultOutput) {
		throw new Error("Build output inside the project must be the dist directory.");
	}

	for (const relativePath of publishPaths) {
		const source = path.join(resolvedRoot, relativePath);

		if (isSameOrParent(source, resolvedOutput) || isSameOrParent(resolvedOutput, source)) {
			throw new Error(`Build output overlaps required input: ${relativePath}`);
		}
	}
}

export async function buildSite(root = projectRoot, output = path.join(root, "dist")) {
	validateOutputPath(root, output);
	await rm(output, { recursive: true, force: true });
	await mkdir(output, { recursive: true });

	for (const relativePath of publishPaths) {
		const source = path.join(root, relativePath);

		try {
			await stat(source);
		} catch {
			throw new Error(`Required build input is missing: ${relativePath}`);
		}

		await cp(source, path.join(output, relativePath), {
			recursive: true,
			filter: sourcePath => path.basename(sourcePath) !== ".DS_Store"
		});
	}

	return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(projectRoot, "dist");
	await buildSite(projectRoot, output);
	console.log(`Build generated at ${path.relative(projectRoot, output) || "."}/`);
}
