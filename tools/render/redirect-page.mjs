import { html } from "./html.mjs";

export function renderLanguageRedirectPage() {
	return html`
		<!DOCTYPE html>
		<html lang="es">
		<head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <meta name="robots" content="noindex, follow">
		  <title>Maximiliano R. Malvicino</title>
		  <script>
		    const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
		    const browserLanguage = navigator.languages?.[0] ?? navigator.language;
		    const language = requestedLanguage === "es" || requestedLanguage === "en"
		      ? requestedLanguage
		      : browserLanguage?.toLowerCase().startsWith("es") ? "es" : "en";
		    window.location.replace("/" + language + "/");
		  </script>
		</head>
		<body>
		  <nav aria-label="Language">
		    <a href="/es/" lang="es">Español</a>
		    <a href="/en/" lang="en">English</a>
		  </nav>
		</body>
		</html>
	` + "\n";
}

export function renderCompatibilityRedirectPage(page) {
	return html`
		<!DOCTYPE html>
		<html lang="es">
		<head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <meta name="robots" content="noindex, follow">
		  <title>Maximiliano R. Malvicino</title>
		  <script>
		    const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
		    const browserLanguage = navigator.languages?.[0] ?? navigator.language;
		    const language = requestedLanguage === "es" || requestedLanguage === "en"
		      ? requestedLanguage
		      : browserLanguage?.toLowerCase().startsWith("es") ? "es" : "en";
		    window.location.replace("/" + language + "/${page}/");
		  </script>
		</head>
		<body>
		  <nav aria-label="Language">
		    <a href="/es/${page}/" lang="es">Español</a>
		    <a href="/en/${page}/" lang="en">English</a>
		  </nav>
		</body>
		</html>
	` + "\n";
}
