import { renderDocument } from "./document.mjs";
import { formatStudyTitle } from "./formatters.mjs";
import { escapeHtml, html } from "./html.mjs";
import { renderFooter, renderJobSearch, renderNavbar } from "./site-chrome.mjs";

function renderCvStudies(data) {
	return data.studies
		.filter(study => study.shownInCv)
		.map(study => html`
			<article class="cv-entry">
			  <h4>${escapeHtml(formatStudyTitle(study, data.language))}</h4>
			  <p>${escapeHtml(study.institution.name)}</p>
			</article>
		`)
		.join("\n");
}

function renderCvProjects(data) {
	return data.projects.filter(project => project.shownInCv).map(project => {
		const projectUrl = project.sourceCode ?? project.liveDemo ?? project.websiteUrl;

		const link = projectUrl
			? `\n${html`<a href="${escapeHtml(projectUrl)}" target="_blank" rel="noopener noreferrer"
			  aria-label="${escapeHtml(`${project.title} (${data.locale.accessibility.newTab})`)}">${escapeHtml(projectUrl)}</a>`}`
			: "";

		return html`
			<article class="cv-entry">
			  <h3>${escapeHtml(project.title)}</h3>
			  <p>${escapeHtml(project.description)}</p>${link}
			</article>
		`;
	}).join("\n");
}

function renderCvJobPeriod(job) {
	const endDate = job.endDate
		? `<time datetime="${escapeHtml(job.endDate)}">${escapeHtml(job.formattedEndDate)}</time>`
		: escapeHtml(job.formattedEndDate);

	return `<time datetime="${escapeHtml(job.startDate)}">${escapeHtml(job.formattedStartDate)}</time> - ${endDate}`;
}

export function renderCvPage(data) {
	const labels = data.locale.labels;
	const skillItems = data.cvSkillGroup.categories
		.map(category => html`
			<li><strong>${escapeHtml(category.label)}:</strong> ${category.technologies.map(technology => escapeHtml(technology.name)).join(", ")}</li>
		`)
		.join("\n");

	const jobs = data.jobs.map(job => {
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
				<p class="cv-technologies">${escapeHtml(labels.cv.technologiesLbl)}: ${job.technologies.map(technology => escapeHtml(technology.name)).join(", ")}</p>
			`}`
			: "";

		return html`
			<article class="cv-entry cv-job">
			  <h3>${escapeHtml(job.position)}</h3>
			  <p class="cv-organization">${escapeHtml(job.organization)}</p>
			  <p class="cv-period">${renderCvJobPeriod(job)}</p>
			  <p>${escapeHtml(job.description)}</p>${highlights}${technologies}
			</article>
		`;
	}).join("\n");

	const body = html`
		<body class="open-sans-font cv-body">
		  ${renderNavbar(data, "cv")}
		  <div class="cv-document">
		    <div class="cv-page">
		      <header class="cv-header">
		        <div class="cv-heading">
		          <h1>${escapeHtml(data.site.profile.fullName)}</h1>
		          <p>${escapeHtml(labels.common.degreesLbl)}</p>
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
		          <p>${escapeHtml(labels.common.presentationLbl)}</p>
		          ${renderJobSearch(data, "cv-job-search")}
		        </section>
		        <section aria-labelledby="skills-label" class="cv-section">
		          <h2 id="skills-label">${escapeHtml(labels.cv.skillsLbl)}</h2>
		          <ul id="skills-list" class="cv-skill-details">
		            ${skillItems}
		          </ul>
		        </section>
		        <section aria-labelledby="experience-label" class="cv-section">
		          <h2 id="experience-label">${escapeHtml(labels.cv.experienceLbl)}</h2>
		          <div id="jobs-list" class="cv-entries">
		            ${jobs}
		          </div>
		        </section>
		        <section aria-labelledby="projects-label" class="cv-section">
		          <h2 id="projects-label">${escapeHtml(labels.cv.projectsLbl)}</h2>
		          <div id="projects-list" class="cv-entries">
		            ${renderCvProjects(data)}
		          </div>
		        </section>
		        <section aria-labelledby="education-label" class="cv-section">
		          <h2 id="education-label">${escapeHtml(labels.cv.educationLbl)}</h2>
		          <div id="studies-list" class="cv-entries">
		            ${renderCvStudies(data)}
		          </div>
		        </section>
		      </main>
		    </div>
		  </div>
		  ${renderFooter(data, "cv")}
		</body>
	`;

	return renderDocument(data, "cv", body);
}
