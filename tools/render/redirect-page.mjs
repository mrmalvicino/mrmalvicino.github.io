import { html } from "./html.mjs";

export function renderLanguageRedirectPage() {
	return html`
		<!DOCTYPE html>
		<html lang="es">
		<head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>Maximiliano R. Malvicino</title>
		  <script>
		    const browserLanguage = navigator.languages?.[0] ?? navigator.language;
		    window.location.replace(browserLanguage?.toLowerCase().startsWith("es") ? "/es/" : "/en/");
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
