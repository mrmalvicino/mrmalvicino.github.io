(() => {
	const profileData = document.querySelector("#cv-profile-data");

	if (!profileData) {
		return;
	}

	const profiles = JSON.parse(profileData.textContent);
	const defaultProfile = profiles.find(profile => profile.default);
	const searchParameters = new URLSearchParams(window.location.search);
	const requestedProfileId = Number(searchParameters.get("profile"));
	const activeProfile = profiles.find(profile => profile.id === requestedProfileId) ?? defaultProfile;

	if (!activeProfile) {
		return;
	}

	document.documentElement.dataset.activeCvProfile = String(activeProfile.id);
	document.querySelector("#cv-professional-profile-name").textContent = activeProfile.name;
	document.querySelector("#cv-professional-profile-description").textContent = activeProfile.description;

	const jobSearch = document.querySelector("#job-search-label");

	if (jobSearch) {
		jobSearch.textContent = activeProfile.jobSearch;
	}

	for (const element of document.querySelectorAll("[data-cv-profiles]")) {
		const profileIds = element.dataset.cvProfiles.split(" ").map(Number);
		element.hidden = !profileIds.includes(activeProfile.id);
	}

	for (const section of document.querySelectorAll("[data-cv-section]")) {
		section.hidden = !section.querySelector("[data-cv-profiles]:not([hidden])");
	}

	if (searchParameters.has("profile")) {
		for (const link of document.querySelectorAll("[data-preserve-cv-profile]")) {
			const url = new URL(link.href);
			url.searchParams.set("profile", String(activeProfile.id));
			link.href = url.pathname + url.search;
		}
	}
})();
