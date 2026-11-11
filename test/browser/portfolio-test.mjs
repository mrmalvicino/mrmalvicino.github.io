import { expect, test as base } from "@playwright/test";

const siteOrigin = "http://127.0.0.1:4174";
const transparentPixel = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Xw54WQAAAABJRU5ErkJggg==",
	"base64"
);

export const test = base.extend({
	page: async ({ page }, use) => {
		const pageErrors = [];
		const failedLocalRequests = [];

		page.on("pageerror", error => pageErrors.push(error.message));
		page.on("requestfailed", request => {
			if (new URL(request.url()).origin === siteOrigin) {
				failedLocalRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
			}
		});
		page.on("response", response => {
			if (new URL(response.url()).origin === siteOrigin && response.status() >= 400) {
				failedLocalRequests.push(`${response.request().method()} ${response.url()}: HTTP ${response.status()}`);
			}
		});

		await page.route("**/*", async route => {
			const request = route.request();
			const requestUrl = new URL(request.url());

			if (requestUrl.origin === siteOrigin) {
				await route.continue();
				return;
			}

			if (requestUrl.pathname.endsWith("bootstrap-icons.css")) {
				await route.fulfill({
					body: '.bi-list::before { content: "\\2630"; }',
					contentType: "text/css"
				});
				return;
			}

			if (request.resourceType() === "image") {
				await route.fulfill({ body: transparentPixel, contentType: "image/png" });
				return;
			}

			if (request.resourceType() === "document") {
				await route.fulfill({ body: "<!doctype html><title>External content</title>", contentType: "text/html" });
				return;
			}

			await route.fulfill({ body: "", status: 204 });
		});

		await use(page);

		expect(pageErrors, "La página no debe producir errores JavaScript no controlados").toEqual([]);
		expect(failedLocalRequests, "Todos los recursos locales deben responder correctamente").toEqual([]);
	}
});

export { expect };

export async function openRenderedPage(page, path, readySelector, expectedCount) {
	await page.goto(path);
	await expect(page.locator(readySelector)).toHaveCount(expectedCount);
}

export async function stabilizeVisualPage(page) {
	await page.addStyleTag({
		content: `
			*, *::before, *::after {
				animation: none !important;
				caret-color: transparent !important;
				transition: none !important;
			}

			iframe {
				visibility: hidden !important;
			}
		`
	});

	await page.evaluate(() => document.fonts.ready);
}
