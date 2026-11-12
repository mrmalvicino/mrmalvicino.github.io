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

export async function loadSiteData(root, language) {
	const [siteContents, localeContents] = await Promise.all([
		readFile(path.join(root, "src/data/site.json"), "utf8"),
		readFile(path.join(root, `src/data/${language}.json`), "utf8")
	]);
	const site = JSON.parse(siteContents);
	const locale = JSON.parse(localeContents);
	const images = {};

	for (const group of Object.values(site.images)) {
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

			images[id] = { id, ...image, ...translation, title };
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
	const institutions = Object.fromEntries(Object.entries(site.institutions).map(([id, institution]) => [
		id,
		{
			...institution,
			id,
			name: requireValue(locale.institutions, id, "institutions"),
			image: requireValue(images, institution.imageId, "images")
		}
	]));

	return {
		language,
		site,
		locale,
		images,
		technologies,
		institutions,
		menuItems: sortByOrder(site.menu).map(item => ({
			...item,
			label: requireValue(locale.menu, item.id, "menu")
		})),
		projects: sortByOrder(site.projects).map(project => ({
			...project,
			...requireValue(locale.projects, project.id, "projects"),
			technologies: project.technologyIds.map(id => requireValue(technologies, id, "technologies"))
		})),
		stacks: sortByOrder(site.skills.stacks).map(stack => ({
			...stack,
			...requireValue(locale.skills, stack.id, "skills")
		})),
		studies: sortByOrder(site.studies).map(study => ({
			...study,
			...requireValue(locale.studies, study.id, "studies"),
			institution: requireValue(institutions, study.institutionId, "institutions")
		})),
		jobs: sortByOrder(site.jobs).map(job => ({
			...job,
			...requireValue(locale.jobs, job.id, "jobs")
		})),
		socials: sortByOrder(site.profile.socials).map(social => ({
			...social,
			label: requireValue(locale.socials, social.id, "socials")
		}))
	};
}
