import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { isPathInside } from "./filesystem.mjs";

const contentTypes = new Map([
	[".css", "text/css; charset=utf-8"],
	[".html", "text/html; charset=utf-8"],
	[".ico", "image/x-icon"],
	[".js", "text/javascript; charset=utf-8"],
	[".jpeg", "image/jpeg"],
	[".jpg", "image/jpeg"],
	[".json", "application/json; charset=utf-8"],
	[".pdf", "application/pdf"],
	[".png", "image/png"],
	[".svg", "image/svg+xml"],
	[".txt", "text/plain; charset=utf-8"],
	[".webp", "image/webp"],
	[".woff2", "font/woff2"],
	[".xml", "application/xml; charset=utf-8"]
]);

export function resolveStaticPath(root, requestUrl) {
	const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
	const requestedPath = path.resolve(root, pathname.replace(/^\/+/, ""));
	const filePath = pathname.endsWith("/") ? path.join(requestedPath, "index.html") : requestedPath;

	return isPathInside(root, filePath) ? filePath : null;
}

export async function startStaticServer({ root, host = "127.0.0.1", port = 0 }) {
	const server = http.createServer(async (request, response) => {
		if (request.method !== "GET" && request.method !== "HEAD") {
			response.writeHead(405).end();
			return;
		}

		let filePath;

		try {
			filePath = resolveStaticPath(root, request.url ?? "/");
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

			response.writeHead(200, {
				"Content-Type": contentTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream"
			});

			response.end(request.method === "HEAD" ? undefined : await readFile(filePath));
		} catch {
			response.writeHead(404).end();
		}
	});

	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, host, resolve);
	});

	const address = server.address();

	if (address === null || typeof address === "string") {
		throw new Error("Static server did not expose a TCP port.");
	}

	return {
		baseUrl: `http://127.0.0.1:${address.port}`,
		close: () => new Promise((resolve, reject) => {
			server.close(error => error ? reject(error) : resolve());
		})
	};
}
