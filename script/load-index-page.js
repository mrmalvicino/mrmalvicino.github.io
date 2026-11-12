document.addEventListener("DOMContentLoaded", async function () {
	setLangAuto();

	if (redirecting) {
		return;
	}

	try {
		const [data] = await Promise.all([loadSiteData(), insertFooter()]);

		renderMenu(data.menuItems);
		renderBanner(data.bannerTechnologyIds, data.technologies);
		renderStacks(data.stacks);
		renderProjects(data.projects.filter(project => project.shown_in_portfolio), data.technologies, data.accessibility);
		renderStudies(data.studies, data.institutions);
		bindCommonImages(data.images.common_images);
		bindCommonImages(data.images.technologies_images);
		bindCommonImages(data.images.institutions_images);
		bindCommonImages(data.images.projects_images);
		bindUniqueLabels(data.labels.index);
		bindCommonLabels(data.labels.common);
		bindTextboxes(data.textboxes);
		bindButtons(data.buttons);
		bindSiteInfo(data.site, data.locale);
		keepQueryParameters();
		defineMenuClosers();
	} catch (error) {
		console.error("Error al cargar los datos del sitio:", error);
	}
});
