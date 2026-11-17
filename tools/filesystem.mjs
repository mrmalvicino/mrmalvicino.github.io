import { readdir } from "node:fs/promises";
import path from "node:path";

export function isPathInside(root, candidate) {
	const relativePath = path.relative(path.resolve(root), path.resolve(candidate));

	return relativePath === "" || (
		relativePath !== ".." &&
		!relativePath.startsWith(`..${path.sep}`) &&
		!path.isAbsolute(relativePath)
	);
}

export async function listFiles(directory, options = {}, prefix = "") {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const relativePath = path.join(prefix, entry.name);

		if (entry.isSymbolicLink()) {
			if (options.rejectSymbolicLinks) {
				throw new Error(`Directory contains a symbolic link: ${relativePath}`);
			}

			continue;
		}

		if (entry.isDirectory()) {
			files.push(...await listFiles(path.join(directory, entry.name), options, relativePath));
		} else {
			files.push(relativePath);
		}
	}

	return files;
}
