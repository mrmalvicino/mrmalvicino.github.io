import path from "node:path";
import { fileURLToPath } from "node:url";
import { startStaticServer } from "../../tools/static-server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../dist");
const port = Number.parseInt(process.env.PORT ?? "4174", 10);
const server = await startStaticServer({ root, host: "0.0.0.0", port });

console.log(`Test server listening on port ${port}`);

for (const signal of ["SIGINT", "SIGTERM"]) {
	process.on(signal, async () => {
		await server.close();
		process.exit(0);
	});
}
