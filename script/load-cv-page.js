document.addEventListener("DOMContentLoaded", async function () {
	setLangAuto();

	if (redirecting) {
		return;
	}

	try {
		const data = await loadSiteData();

		renderCvStacks(data.stacks);
		renderCvStudies(data.studies, data.institutions);
		renderCvProjects(data.projects.filter(project => project.shown_in_cv));
		renderCvJobs(data.jobs);
		bindCommonImages(data.images.common_images);
		bindUniqueLabels(data.labels.cv);
		bindCommonLabels(data.labels.common);
		bindSiteInfo(data.site, data.locale);
	} catch (error) {
		console.error("Error al cargar los datos del sitio:", error);
	}
});
