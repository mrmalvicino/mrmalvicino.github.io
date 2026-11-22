import { renderDocument } from "./document.mjs";
import { formatStudyTitle } from "./formatters.mjs";
import { escapeHtml, html } from "./html.mjs";
import { renderFooter, renderJobSearch, renderNavbar } from "./site-chrome.mjs";

function renderProfileAttributes(item, defaultProfileId) {
	const hidden = item.cvProfiles.includes(defaultProfileId) ? "" : " hidden";

	return ` data-cv-profiles="${item.cvProfiles.join(" ")}"${hidden}`;
}

function renderCvStudies(data) {
	return data.studies
		.filter(study => study.cvProfiles.length > 0)
		.map(study => html`
			<article class="cv-entry"${renderProfileAttributes(study, data.defaultProfessionalProfile.id)}>
			  <h4>${escapeHtml(formatStudyTitle(study, data.language))}</h4>
			  <p>${escapeHtml(study.institution.name)}</p>
			</article>
		`)
		.join("\n");
}

function renderCvProjects(data) {
	return data.projects
		.filter(project => project.cvProfiles.length > 0)
		.map(project => {
			const projectUrl = project.sourceCode ?? project.liveDemo ?? project.websiteUrl;

			const link = projectUrl
				? `\n${html`<a href="${escapeHtml(projectUrl)}" target="_blank" rel="noopener noreferrer"
				  aria-label="${escapeHtml(`${project.title} (${data.locale.accessibility.newTab})`)}">${escapeHtml(projectUrl)}</a>`}`
				: "";

			return html`
				<article class="cv-entry"${renderProfileAttributes(project, data.defaultProfessionalProfile.id)}>
				  <h3>${escapeHtml(project.title)}</h3>
				  <p>${escapeHtml(project.description)}</p>${link}
				</article>
			`;
		})
		.join("\n");
}

function renderCvSkillItems(data) {
	return data.skillGroups
		.filter(group => group.cvProfiles.length > 0)
		.map(group => {
			const attributes = renderProfileAttributes(group, data.defaultProfessionalProfile.id);
			const items = group.skillIds
				? group.skillItems
				: (group.categories
					? group.categories.flatMap(category => category.technologies)
					: group.technologies).map(technology => technology.name);

			return html`
				<li${attributes}><strong>${escapeHtml(group.label)}:</strong> ${items.map(escapeHtml).join(", ")}</li>
			`;
		})
		.join("\n");
}

function renderCvJobPeriod(job) {
	const endDate = job.endDate
		? `<time datetime="${escapeHtml(job.endDate)}">${escapeHtml(job.formattedEndDate)}</time>`
		: escapeHtml(job.formattedEndDate);

	return `<time datetime="${escapeHtml(job.startDate)}">${escapeHtml(job.formattedStartDate)}</time> - ${endDate}`;
}

function renderCvJobs(data) {
	return data.jobs
		.filter(job => job.cvProfiles.length > 0)
		.map(job => {
			const highlights = job.highlights
				? `\n${html`
					<ul class="cv-job-highlights">
					  ${job.highlights.map(highlight => html`
							<li>${escapeHtml(highlight)}</li>
						`).join("\n")}
					</ul>
				`}`
				: "";

			const technologies = job.technologies.length > 0
				? `\n${html`
					<p class="cv-technologies">${escapeHtml(data.locale.labels.cv.technologiesLbl)}: ${job.technologies.map(technology => escapeHtml(technology.name)).join(", ")}</p>
				`}`
				: "";

			return html`
				<article class="cv-entry cv-job"${renderProfileAttributes(job, data.defaultProfessionalProfile.id)}>
				  <h3>${escapeHtml(job.position)}</h3>
				  <p class="cv-organization">${escapeHtml(job.organization)}</p>
				  <p class="cv-period">${renderCvJobPeriod(job)}</p>
				  <p>${escapeHtml(job.description)}</p>${highlights}${technologies}
				</article>
			`;
		})
		.join("\n");
}

function renderProfileData(data) {
	return JSON.stringify(data.professionalProfiles).replaceAll("<", "\\u003c");
}

export function renderCvPage(data) {
	const labels = data.locale.labels;
	const defaultProfile = data.defaultProfessionalProfile;

	const body = html`
		<body class="open-sans-font cv-body">
		  ${renderNavbar(data, "cv")}
		  <div class="cv-document">
		    <div class="cv-page">
		      <header class="cv-header">
		        <div class="cv-heading">
		          <h1>${escapeHtml(data.site.profile.fullName)}</h1>
		          <p id="cv-professional-profile-name">${escapeHtml(defaultProfile.name)}</p>
		        </div>
		        <address class="cv-contact">
		          <div class="cv-contact-row">
		            <a href="${escapeHtml(data.site.profile.website.href)}">${escapeHtml(data.site.profile.website.label)}</a>
		            <a href="${escapeHtml(data.site.profile.linkedin.href)}" target="_blank" rel="noopener noreferrer"
		              aria-label="${escapeHtml(`LinkedIn (${data.locale.accessibility.newTab})`)}">${escapeHtml(data.site.profile.linkedin.label)}</a>
		            <a href="${escapeHtml(data.site.profile.email.href)}">${escapeHtml(data.site.profile.email.address)}</a>
		            <a href="${escapeHtml(data.site.profile.phone.href)}">${escapeHtml(data.site.profile.phone.label)}</a>
		            <a href="${escapeHtml(data.site.profile.location.href)}" target="_blank" rel="noopener noreferrer"
		              aria-label="${escapeHtml(`${data.locale.profile.cvLocation} (${data.locale.accessibility.newTab})`)}">${escapeHtml(data.locale.profile.cvLocation)}</a>
		          </div>
		        </address>
		      </header>
		      <main class="cv-main" id="main-content" tabindex="-1">
		        <section aria-labelledby="profile-label" class="cv-section">
		          <h2 id="profile-label">${escapeHtml(labels.cv.profileLbl)}</h2>
		          <p id="cv-professional-profile-description">${escapeHtml(defaultProfile.description)}</p>
		          ${renderJobSearch(data, "cv-job-search")}
		        </section>
		        <section aria-labelledby="skills-label" class="cv-section" data-cv-section>
		          <h2 id="skills-label">${escapeHtml(labels.cv.skillsLbl)}</h2>
		          <ul id="skills-list" class="cv-skill-details">
		            ${renderCvSkillItems(data)}
		          </ul>
		        </section>
		        <section aria-labelledby="experience-label" class="cv-section" data-cv-section>
		          <h2 id="experience-label">${escapeHtml(labels.cv.experienceLbl)}</h2>
		          <div id="jobs-list" class="cv-entries">
		            ${renderCvJobs(data)}
		          </div>
		        </section>
		        <section aria-labelledby="projects-label" class="cv-section" data-cv-section>
		          <h2 id="projects-label">${escapeHtml(labels.cv.projectsLbl)}</h2>
		          <div id="projects-list" class="cv-entries">
		            ${renderCvProjects(data)}
		          </div>
		        </section>
		        <section aria-labelledby="education-label" class="cv-section" data-cv-section>
		          <h2 id="education-label">${escapeHtml(labels.cv.educationLbl)}</h2>
		          <div id="studies-list" class="cv-entries">
		            ${renderCvStudies(data)}
		          </div>
		        </section>
		      </main>
		    </div>
		  </div>
		  ${renderFooter(data, "cv")}
		  <script id="cv-profile-data" type="application/json">${renderProfileData(data)}</script>
		</body>
	`;

	return renderDocument(data, "cv", body);
}
