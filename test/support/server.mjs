import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../dist");
const port = Number.parseInt(process.env.PORT ?? "4174", 10);
const contentTypes = new Map([
	[".css", "text/css; charset=utf-8"],
	[".html", "text/html; charset=utf-8"],
	[".ico", "image/x-icon"],
	[".js", "text/javascript; charset=utf-8"],
	[".json", "application/json; charset=utf-8"],
	[".pdf", "application/pdf"],
	[".png", "image/png"],
	[".svg", "image/svg+xml"],
	[".webp", "image/webp"]
]);

function resolveRequestPath(requestUrl) {
	const url = new URL(requestUrl, `http://127.0.0.1:${port}`);
	const pathname = decodeURIComponent(url.pathname);
	const relativePath = pathname.replace(/^\/+/, "");
	const requestedPath = path.resolve(root, relativePath);
	let filePath = requestedPath;

	if (pathname.endsWith("/")) {
		filePath = path.join(requestedPath, "index.html");
	}
	const pathFromRoot = path.relative(root, filePath);

	if (pathFromRoot === ".." || pathFromRoot.startsWith(`..${path.sep}`) || path.isAbsolute(pathFromRoot)) {
		return null;
	}

	return filePath;
}

const server = http.createServer(async (request, response) => {
	if (request.method !== "GET" && request.method !== "HEAD") {
		response.writeHead(405).end();
		return;
	}

	let filePath;

	try {
		filePath = resolveRequestPath(request.url ?? "/");
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

		if (request.method === "HEAD") {
			response.end();
			return;
		}

		response.end(await readFile(filePath));
	} catch {
		response.writeHead(404).end();
	}
});

server.listen(port, "127.0.0.1", () => {
	console.log(`Test server listening on http://127.0.0.1:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, () => server.close(() => process.exit(0)));
}
