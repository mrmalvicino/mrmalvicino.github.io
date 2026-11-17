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

const pageStyles = {
	index: ["portfolio.css", "project-cards.css", "inputs.css", "table.css"],
	projects: ["project-cards.css", "projects.css"],
	cv: ["cv.css"]
};

export const styleBundles = Object.fromEntries(Object.entries(pageStyles).map(([page, styles]) => [
	page,
	[...foundationStyles, ...sharedComponentStyles, ...styles, ...utilityStyles]
]));
