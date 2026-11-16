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

function absoluteUrl(data, value) {
	return new URL(value, `${data.site.profile.website.href}/`).href;
}

function renderStructuredData(data, page, canonicalUrl) {
	const siteUrl = absoluteUrl(data, "/").replace(/\/$/, "");
	const personId = `${siteUrl}/#person`;
	const websiteId = `${siteUrl}/#website`;
	const graph = [
		{
			"@type": "Person",
			"@id": personId,
			name: data.site.profile.fullName,
			url: siteUrl,
			image: absoluteUrl(data, data.images.profileImg.src),
			jobTitle: data.locale.labels.common.degreesLbl,
			description: data.locale.seo.index.description,
			sameAs: data.site.profile.socials
				.filter(social => ["github", "linkedin"].includes(social.id))
				.map(social => social.href)
		},
		{
			"@type": "WebSite",
			"@id": websiteId,
			url: `${siteUrl}/`,
			name: data.site.profile.fullName,
			inLanguage: ["es", "en"],
			publisher: { "@id": personId }
		},
		{
			"@type": page === "projects" ? "CollectionPage" : "ProfilePage",
			"@id": `${canonicalUrl}#web-page`,
			url: canonicalUrl,
			name: data.locale.seo[page].title,
			description: data.locale.seo[page].description,
			inLanguage: data.language,
			isPartOf: { "@id": websiteId },
			...(page === "projects" ? {} : { mainEntity: { "@id": personId } })
		}
	];

	return JSON.stringify({
		"@context": "https://schema.org",
		"@graph": graph
	}).replaceAll("<", "\\u003c");
}

function renderHead(data, page, styleFiles) {
	const seo = data.locale.seo[page];
	const siteUrl = absoluteUrl(data, "/").replace(/\/$/, "");
	const canonicalUrl = absoluteUrl(data, route(data.language, page));
	const spanishUrl = absoluteUrl(data, route("es", page));
	const englishUrl = absoluteUrl(data, route("en", page));
	const socialImageUrl = absoluteUrl(data, data.site.configuration.socialImage);
	const styleLinks = styleFiles
		.map(file => `<link rel="stylesheet" type="text/css" href="/style/${file}">`)
		.join("\n");

	return html`
		<head>
		  <meta charset="UTF-8">
		  <meta http-equiv="X-UA-Compatible" content="IE=edge">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>${escapeHtml(seo.title)}</title>
		  <meta name="description" content="${escapeHtml(seo.description)}">
		  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
		  <link rel="alternate" hreflang="es" href="${escapeHtml(spanishUrl)}">
		  <link rel="alternate" hreflang="en" href="${escapeHtml(englishUrl)}">
		  <link rel="alternate" hreflang="x-default" href="${escapeHtml(siteUrl)}/">
		  <meta property="og:type" content="${page === "projects" ? "website" : "profile"}">
		  <meta property="og:site_name" content="${escapeHtml(data.site.profile.fullName)}">
		  <meta property="og:locale" content="${data.language === "es" ? "es_AR" : "en_US"}">
		  <meta property="og:locale:alternate" content="${data.language === "es" ? "en_US" : "es_AR"}">
		  <meta property="og:title" content="${escapeHtml(seo.title)}">
		  <meta property="og:description" content="${escapeHtml(seo.description)}">
		  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
		  <meta property="og:image" content="${escapeHtml(socialImageUrl)}">
		  <meta property="og:image:alt" content="${escapeHtml(seo.title)}">
		  <meta name="twitter:card" content="summary_large_image">
		  <meta name="twitter:title" content="${escapeHtml(seo.title)}">
		  <meta name="twitter:description" content="${escapeHtml(seo.description)}">
		  <meta name="twitter:image" content="${escapeHtml(socialImageUrl)}">
		  <link rel="icon" type="image/x-icon" href="/assets/images/favicon.ico">
		  <link rel="preconnect" href="https://fonts.googleapis.com">
		  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300&display=swap">
		  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap">
		  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
		  ${styleLinks}
		  <script type="application/ld+json">${renderStructuredData(data, page, canonicalUrl)}</script>
		</head>
	`;
}

export function renderDocument(data, page, body, pageStyles, scripts = []) {
	const styleFiles = [...foundationStyles, ...sharedComponentStyles, ...pageStyles, ...utilityStyles];
	const scriptElements = scripts
		.map(file => `<script src="/script/${file}"></script>`)
		.join("\n");

	return html`
		<!DOCTYPE html>
		<html lang="${escapeHtml(data.language)}">
		${renderHead(data, page, styleFiles)}
		${body}
		${scriptElements}
		</html>
	` + "\n";
}

export function route(language, page) {
	return `/${language}/${page === "index" ? "" : `${page}/`}`;
}
