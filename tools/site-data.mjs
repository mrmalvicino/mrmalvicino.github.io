import { readFile } from "node:fs/promises";
import path from "node:path";

function requireValue(values, id, collection) {
	const value = values[id];

	if (value === undefined) {
		throw new Error(`Missing ${collection}.${id}`);
	}

	return value;
}

function sortByOrder(items) {
	return [...items].sort((first, second) => first.order - second.order);
}

function formatJobDate(value, language) {
	const date = new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00Z`);

	return new Intl.DateTimeFormat(language, {
		month: "long",
		timeZone: "UTC",
		year: "numeric"
	}).format(date);
}

export async function loadSiteData(root, language) {
	const [siteContents, localeContents] = await Promise.all([
		readFile(path.join(root, "src/data/site.json"), "utf8"),
		readFile(path.join(root, `src/data/${language}.json`), "utf8")
	]);
	const site = JSON.parse(siteContents);
	const locale = JSON.parse(localeContents);
	const images = {};
	const imageMaps = [
		site.images.commonImages,
		site.images.technologyImages,
		site.images.institutionImages,
		site.images.projectImages
	];

	for (const group of imageMaps) {
		for (const [id, image] of Object.entries(group)) {
			const translation = requireValue(locale.images, id, "images");
			const technology = Object.entries(site.technologies)
				.find(([, item]) => item.imageId === id);
			const title = translation.title ?? (technology
				? requireValue(locale.technologies, technology[0], "technologies")
				: undefined);

			if (title === undefined) {
				throw new Error(`Missing images.${id}.title`);
			}

			images[id] = { ...image, ...translation, title };
		}
	}

	const technologies = Object.fromEntries(Object.entries(site.technologies).map(([id, technology]) => [
		id,
		{
			...technology,
			id,
			name: requireValue(locale.technologies, id, "technologies"),
			image: requireValue(images, technology.imageId, "images")
		}
	]));

	const projectTypes = Object.fromEntries(Object.keys(site.projectTypes).map(id => [
		id,
		{
			id,
			name: requireValue(locale.projectTypes, id, "projectTypes")
		}
	]));
	const participationModes = Object.fromEntries(Object.keys(site.participationModes).map(id => [
		id,
		{
			id,
			name: requireValue(locale.participationModes, id, "participationModes")
		}
	]));

	const institutions = Object.fromEntries(Object.entries(site.institutions).map(([id, institution]) => [
		id,
		{
			...institution,
			id,
			name: requireValue(locale.institutions, id, "institutions"),
			image: requireValue(images, institution.imageId, "images")
		}
	]));
	const skillGroups = sortByOrder(site.skills.groups).map(group => ({
		...group,
		label: requireValue(locale.skills.groups, group.id, "skills.groups"),
		categories: group.categories
			? sortByOrder(group.categories).map(category => ({
				...category,
				label: requireValue(locale.skills.categories, category.id, "skills.categories"),
				technologies: category.technologyIds.map(id => requireValue(technologies, id, "technologies"))
			}))
			: null,
		technologies: group.technologyIds
			? group.technologyIds.map(id => requireValue(technologies, id, "technologies"))
			: []
	}));
	const professionalProfiles = sortByOrder(site.professionalProfiles).map(profile => ({
		...profile,
		...requireValue(locale.professionalProfiles, profile.id, "professionalProfiles")
	}));
	const defaultProfessionalProfile = professionalProfiles.find(profile => profile.default);

	return {
		language,
		site,
		locale,
		images,
		technologies,
		projectTypes,
		participationModes,
		institutions,
		menuItems: sortByOrder(site.menu).map(item => ({
			...item,
			label: requireValue(locale.menu, item.id, "menu")
		})),
		projects: sortByOrder(site.projects).map(project => ({
			...project,
			...requireValue(locale.projects, project.id, "projects"),
			participationMode: requireValue(participationModes, project.participationModeId, "participationModes"),
			types: project.typeIds.map(id => requireValue(projectTypes, id, "projectTypes")),
			technologies: project.technologyIds.map(id => requireValue(technologies, id, "technologies")),
			image: requireValue(images, project.mockupId ?? site.images.defaultProjectImageId, "images")
		})),
		skillDescription: locale.skills.description,
		skillGroups,
		professionalProfiles,
		defaultProfessionalProfile,
		studies: sortByOrder(site.studies).map(study => ({
			...study,
			...requireValue(locale.studies, study.id, "studies"),
			institution: requireValue(institutions, study.institutionId, "institutions")
		})),
		jobs: sortByOrder(site.jobs).map(job => ({
			...job,
			...requireValue(locale.jobs, job.id, "jobs"),
			formattedStartDate: formatJobDate(job.startDate, language),
			formattedEndDate: job.endDate ? formatJobDate(job.endDate, language) : locale.labels.cv.presentLbl,
			time: `${formatJobDate(job.startDate, language)} - ${job.endDate
				? formatJobDate(job.endDate, language)
				: locale.labels.cv.presentLbl}`,
			technologies: job.technologyIds
				? job.technologyIds.map(id => requireValue(technologies, id, "technologies"))
				: []
		})),
		socials: sortByOrder(site.profile.socials).map(social => ({
			...social,
			label: requireValue(locale.socials, social.id, "socials")
		}))
	};
}
