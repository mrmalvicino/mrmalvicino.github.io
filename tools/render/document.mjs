import { escapeHtml, html } from "./html.mjs";

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

function renderHead(data, page, scripts) {
	const seo = data.locale.seo[page];
	const siteUrl = absoluteUrl(data, "/").replace(/\/$/, "");
	const canonicalUrl = absoluteUrl(data, route(data.language, page));
	const spanishUrl = absoluteUrl(data, route("es", page));
	const englishUrl = absoluteUrl(data, route("en", page));
	const socialImageUrl = absoluteUrl(data, data.site.configuration.socialImage);
	const scriptElements = scripts
		.map(file => `<script src="/script/${file}" defer></script>`)
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
		  <link rel="preload" href="/assets/fonts/open-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
		  <link rel="preload" href="/assets/fonts/jost-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
		  <link rel="preload" href="/assets/fonts/bootstrap-icons.woff2" as="font" type="font/woff2" crossorigin>
		  <link rel="stylesheet" type="text/css" href="/style/bundles/${page}.css">
		  ${scriptElements}
		  <script type="application/ld+json">${renderStructuredData(data, page, canonicalUrl)}</script>
		</head>
	`;
}

export function renderDocument(data, page, body, scripts = []) {
	return html`
		<!DOCTYPE html>
		<html lang="${escapeHtml(data.language)}">
		${renderHead(data, page, scripts)}
		${body}
		</html>
	` + "\n";
}

export function route(language, page) {
	return `/${language}/${page === "index" ? "" : `${page}/`}`;
}
