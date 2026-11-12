document.addEventListener("DOMContentLoaded", async function () {
	setLangAuto();

	if (redirecting) {
		return;
	}

	try {
		const [data] = await Promise.all([loadSiteData(), insertFooter()]);

		renderProjects(data.projects, data.technologies, data.accessibility);
		bindCommonImages(data.images.common_images);
		bindCommonImages(data.images.projects_images);
		bindCommonImages(data.images.technologies_images);
		bindUniqueLabels(data.labels.projects);
		bindCommonLabels(data.labels.common);
		bindSiteInfo(data.site, data.locale);
		keepQueryParameters();
	} catch (error) {
		console.error("Error al cargar los datos del sitio:", error);
	}
});
