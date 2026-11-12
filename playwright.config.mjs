import { defineConfig } from "@playwright/test";

const port = process.env.PORT ?? "4174";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
	testDir: "test/browser",
	fullyParallel: true,
	outputDir: "test-results",
	reporter: "list",
	snapshotPathTemplate: "{testDir}/snapshots/{testFilePath}/{arg}{ext}",
	use: {
		baseURL,
		browserName: "chromium",
		locale: "es-AR",
		trace: "retain-on-failure"
	},
	webServer: {
		command: "npm run build && node test/support/server.mjs",
		url: baseURL,
		reuseExistingServer: !process.env.CI
	},
	expect: {
		toHaveScreenshot: {
			animations: "disabled",
			maxDiffPixelRatio: 0.02
		}
	}
});
