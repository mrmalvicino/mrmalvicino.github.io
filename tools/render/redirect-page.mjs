import { html } from "./html.mjs";
import { defaultLanguage, getPage, languages, route } from "../site-manifest.mjs";

function renderRedirectPage(pageId = "index") {
	const page = getPage(pageId);
	const supportedLanguages = JSON.stringify(languages.map(language => language.id));
	const links = languages.map(language => (
		`<a href="${route(language.id, page.id)}" lang="${language.id}">${language.label}</a>`
	)).join("\n");

	return html`
		<!DOCTYPE html>
		<html lang="${defaultLanguage}">
		<head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <meta name="robots" content="noindex, follow">
		  <title>Maximiliano R. Malvicino</title>
		  <script>
		    const supportedLanguages = ${supportedLanguages};
		    const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
		    const browserLanguage = navigator.languages?.[0] ?? navigator.language;
		    const language = supportedLanguages.includes(requestedLanguage)
		      ? requestedLanguage
		      : supportedLanguages.find(item => browserLanguage?.toLowerCase().startsWith(item)) ?? "${defaultLanguage}";
		    window.location.replace("/" + language + "/${page.path ? `${page.path}/` : ""}");
		  </script>
		</head>
		<body>
		  <nav aria-label="Language">
		    ${links}
		  </nav>
		</body>
		</html>
	` + "\n";
}

export function renderLanguageRedirectPage() {
	return renderRedirectPage();
}

export function renderCompatibilityRedirectPage(page) {
	return renderRedirectPage(page);
}
