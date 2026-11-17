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

export const languages = [
	{ id: "es", label: "ES", ogLocale: "es_AR", resumeFile: "malvicino-es.pdf" },
	{ id: "en", label: "EN", ogLocale: "en_US", resumeFile: "malvicino-en.pdf" }
];

export const defaultLanguage = "en";

export const pages = [
	{
		id: "index",
		path: "",
		legacyFile: null,
		styles: ["portfolio.css", "project-cards.css", "inputs.css", "table.css"],
		scripts: ["menu.js", "email-copy.js", "contact-form.js"]
	},
	{
		id: "projects",
		path: "projects",
		legacyFile: "projects.html",
		styles: ["project-cards.css", "projects.css"],
		scripts: ["project-filters.js"]
	},
	{
		id: "cv",
		path: "cv",
		legacyFile: "cv.html",
		styles: ["cv.css"],
		scripts: []
	}
].map(page => ({
	...page,
	styles: [...foundationStyles, ...sharedComponentStyles, ...page.styles, ...utilityStyles]
}));

export const publicScripts = [...new Set(pages.flatMap(page => page.scripts))];

export function getLanguage(languageId) {
	const language = languages.find(item => item.id === languageId);

	if (!language) {
		throw new Error(`Unknown language: ${languageId}`);
	}

	return language;
}

export function getPage(pageId) {
	const page = pages.find(item => item.id === pageId);

	if (!page) {
		throw new Error(`Unknown page: ${pageId}`);
	}

	return page;
}

export function route(languageId, pageId) {
	const page = getPage(pageId);

	return `/${languageId}/${page.path ? `${page.path}/` : ""}`;
}

export function outputFile(languageId, pageId) {
	const page = getPage(pageId);

	return `${languageId}/${page.path ? `${page.path}/` : ""}index.html`;
}
