import { escapeHtml, html } from "./html.mjs";

const foundationStyles = [
	"variables.css",
	"controls.css"
];

const sharedComponentStyles = [
	"buttons.css",
	"images.css",
	"site-chrome.css"
];

const utilityStyles = [
	"colors.css",
	"flexbox.css",
	"fonts.css",
	"heights.css",
	"margins.css",
	"paddings.css",
	"widths.css"
];

function renderHead(data, styleFiles) {
	const styleLinks = styleFiles
		.map(file => `<link rel="stylesheet" type="text/css" href="/style/${file}">`)
		.join("\n");

	return html`
		<head>
		  <meta charset="UTF-8">
		  <meta http-equiv="X-UA-Compatible" content="IE=edge">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>${escapeHtml(data.site.profile.pageTitle)}</title>
		  <link rel="icon" type="image/x-icon" href="/assets/images/favicon.ico">
		  <link rel="preconnect" href="https://fonts.googleapis.com">
		  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300&display=swap">
		  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap">
		  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
		  ${styleLinks}
		</head>
	`;
}

export function renderDocument(data, body, pageStyles, scripts = []) {
	const styleFiles = [...foundationStyles, ...sharedComponentStyles, ...pageStyles, ...utilityStyles];
	const scriptElements = scripts
		.map(file => `<script src="/script/${file}"></script>`)
		.join("\n");

	return html`
		<!DOCTYPE html>
		<html lang="${escapeHtml(data.language)}">
		${renderHead(data, styleFiles)}
		${body}
		${scriptElements}
		</html>
	` + "\n";
}

export function route(language, page) {
	return `/${language}/${page === "index" ? "" : `${page}/`}`;
}
