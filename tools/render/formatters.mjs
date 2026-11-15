export function formatStudyTitle(study, language) {
	if (!study.graduation_date) {
		return study.title;
	}

	const graduationDate = new Intl.DateTimeFormat(language, {
		day: "numeric",
		month: "long",
		timeZone: "UTC",
		year: "numeric"
	}).format(new Date(`${study.graduation_date}T00:00:00Z`));

	return `${study.title} (${graduationDate})`;
}
