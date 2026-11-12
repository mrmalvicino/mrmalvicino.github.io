async function fetchJson(path) {
	const response = await fetch(path);

	if (!response.ok) {
		throw new Error(`No se pudo cargar ${path}: ${response.status}`);
	}

	return response.json();
}

function requireTranslation(translations, id, collection) {
	const translation = translations[id];

	if (translation === undefined) {
		throw new Error(`Falta la traducción ${collection}.${id}`);
	}

	return translation;
}

function requireEntity(entities, id, collection) {
	const entity = entities[id];

	if (entity === undefined) {
		throw new Error(`Falta la entidad ${collection}.${id}`);
	}

	return entity;
}

function resolveLabels(labels) {
	return Object.entries(labels).map(([id, textContent]) => ({
		id,
		text_content: textContent
	}));
}

function resolveCatalog(entities, translations, collection) {
	return Object.fromEntries(Object.entries(entities).map(([id, entity]) => [
		id,
		{
			...entity,
			name: requireTranslation(translations, id, collection)
		}
	]));
}

function resolveImages(images, translations, technologyImageTitles) {
	return Object.fromEntries(Object.entries(images).map(([group, items]) => [
		group,
		Object.entries(items).map(([id, image]) => {
			const translation = requireTranslation(translations, id, "images");
			const title = translation.title ?? technologyImageTitles[id];

			if (title === undefined) {
				throw new Error(`Falta el título de la imagen images.${id}`);
			}

			return {
				id,
				...image,
				...translation,
				title
			};
		})
	]));
}

async function loadSiteData(language = getLang()) {
	const [site, locale] = await Promise.all([
		fetchJson("data/site.json"),
		fetchJson(`data/${language}.json`)
	]);
	const technologyImageTitles = Object.fromEntries(Object.entries(site.technologies).map(([id, technology]) => [
		technology.imageId,
		requireTranslation(locale.technologies, id, "technologies")
	]));

	return {
		site,
		locale,
		accessibility: locale.accessibility,
		technologies: resolveCatalog(site.technologies, locale.technologies, "technologies"),
		institutions: resolveCatalog(site.institutions, locale.institutions, "institutions"),
		menuItems: site.menu.map(item => ({
			...item,
			label: requireTranslation(locale.menu, item.id, "menu")
		})),
		images: resolveImages(site.images, locale.images, technologyImageTitles),
		projects: site.projects.map(project => ({
			...project,
			...requireTranslation(locale.projects, project.id, "projects")
		})),
		bannerTechnologyIds: site.skills.bannerTechnologyIds,
		stacks: site.skills.stacks.map(stack => ({
			...stack,
			...requireTranslation(locale.skills, stack.id, "skills")
		})),
		studies: site.studies.map(study => ({
			...study,
			...requireTranslation(locale.studies, study.id, "studies")
		})),
		jobs: site.jobs.map(job => ({
			...job,
			...requireTranslation(locale.jobs, job.id, "jobs")
		})),
		labels: {
			common: resolveLabels(locale.labels.common),
			index: resolveLabels(locale.labels.index),
			projects: resolveLabels(locale.labels.projects),
			cv: resolveLabels(locale.labels.cv)
		},
		textboxes: Object.entries(locale.placeholders).map(([id, placeholder]) => ({ id, placeholder })),
		buttons: {
			a_items: [{
				id: site.controls.resumeButtonId,
				...site.resumes[language]
			}],
			button_items: [{
				id: site.controls.submitButtonId,
				text_content: requireTranslation(locale.buttons, site.controls.submitButtonId, "buttons")
			}]
		}
	};
}

window.loadSiteData = loadSiteData;
