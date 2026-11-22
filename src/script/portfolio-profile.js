(() => {
	const profileData = document.querySelector("#portfolio-profile-data");

	if (!profileData) {
		return;
	}

	const profiles = JSON.parse(profileData.textContent);
	const defaultProfile = profiles.find(profile => profile.default);
	const searchParameters = new URLSearchParams(window.location.search);

	if (!searchParameters.has("profile")) {
		return;
	}

	const requestedProfileId = Number(searchParameters.get("profile"));
	const activeProfile = profiles.find(profile => profile.id === requestedProfileId) ?? defaultProfile;

	if (!activeProfile) {
		return;
	}

	const resumeButton = document.querySelector("#resume-btn");
	const onlineResumeButton = document.querySelector("#online-resume-btn");

	resumeButton.href = `/assets/cv/${activeProfile.resumeFile}`;
	resumeButton.download = activeProfile.resumeFile;

	const onlineResumeUrl = new URL(onlineResumeButton.href);
	onlineResumeUrl.searchParams.set("profile", String(activeProfile.id));
	onlineResumeButton.href = onlineResumeUrl.pathname + onlineResumeUrl.search;
})();
