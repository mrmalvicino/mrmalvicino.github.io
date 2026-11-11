import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "test/browser",
	fullyParallel: true,
	outputDir: "test-results",
	reporter: "list",
	snapshotPathTemplate: "{testDir}/snapshots/{testFilePath}/{arg}{ext}",
	use: {
		baseURL: "http://127.0.0.1:4174",
		browserName: "chromium",
		locale: "es-AR",
		trace: "retain-on-failure"
	},
	webServer: {
		command: "node test/support/server.mjs",
		url: "http://127.0.0.1:4174",
		reuseExistingServer: false
	},
	expect: {
		toHaveScreenshot: {
			animations: "disabled",
			maxDiffPixelRatio: 0.02
		}
	}
});
