export function formatStudyTitle(study, language) {
	if (!study.graduationDate) {
		return study.title;
	}

	const graduationDate = new Intl.DateTimeFormat(language, {
		day: "numeric",
		month: "long",
		timeZone: "UTC",
		year: "numeric"
	}).format(new Date(`${study.graduationDate}T00:00:00Z`));

	return `${study.title} (${graduationDate})`;
}
