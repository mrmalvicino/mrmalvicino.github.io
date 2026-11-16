import { renderDocument } from "./document.mjs";
import { formatStudyTitle } from "./formatters.mjs";
import { escapeHtml, html } from "./html.mjs";
import { renderFooter, renderJobSearch, renderNavbar } from "./site-chrome.mjs";

const styles = ["cv.css"];

function renderCvStudies(data, type) {
	return data.studies
		.filter(study => study.type === type && study.shown_in_cv)
		.map(study => html`
			<article class="cv-entry">
			  <h4>${escapeHtml(formatStudyTitle(study, data.language))}</h4>
			  <p>${escapeHtml(study.institution.name)}</p>
			</article>
		`)
		.join("\n");
}

function renderCvProjects(data) {
	return data.projects.filter(project => project.shown_in_cv).map(project => {
		const projectUrl = project.source_code ?? project.live_demo ?? project.website_url;

		const link = projectUrl
			? `\n${html`<a href="${escapeHtml(projectUrl)}">${escapeHtml(projectUrl)}</a>`}`
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
	const endDate = job.end_date
		? `<time datetime="${escapeHtml(job.end_date)}">${escapeHtml(job.time.split(" - ")[1])}</time>`
		: escapeHtml(job.time.split(" - ")[1]);

	return `<time datetime="${escapeHtml(job.start_date)}">${escapeHtml(job.time.split(" - ")[0])}</time> - ${endDate}`;
}

export function renderCvPage(data) {
	const labels = data.locale.labels;
	const professionalSkills = data.skillGroups.find(group => group.id === "professionalCore");

	const skillItems = professionalSkills.categories
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
		          <p>${escapeHtml(labels.cv.positionLbl)}</p>
		        </div>
		        <address class="cv-contact">
		          <div class="cv-contact-row">
		            <a href="${escapeHtml(data.site.profile.website.href)}">${escapeHtml(data.site.profile.website.label)}</a>
		            <a href="${escapeHtml(data.site.profile.linkedin.href)}" target="_blank" rel="noreferrer">LinkedIn: ${escapeHtml(data.site.profile.linkedin.label)}</a>
		          </div>
		          <div class="cv-contact-row">
		            <a href="${escapeHtml(data.site.profile.email.href)}">${escapeHtml(data.site.profile.email.address)}</a>
		            <a href="${escapeHtml(data.site.profile.phone.href)}">${escapeHtml(data.site.profile.phone.label)}</a>
		          </div>
		          <div class="cv-contact-row">
		            <a href="${escapeHtml(data.site.profile.location.href)}" target="_blank" rel="noreferrer">${escapeHtml(data.locale.profile.cvLocation)}</a>
		          </div>
		        </address>
		      </header>
		      <main class="cv-main">
		        <section aria-labelledby="profileLbl" class="cv-section">
		          <h2 id="profileLbl">${escapeHtml(labels.cv.profileLbl)}</h2>
		          <p>${escapeHtml(labels.common.presentationLbl)}</p>
		          ${renderJobSearch(data, "cv-job-search")}
		        </section>
		        <section aria-labelledby="skillsLbl" class="cv-section">
		          <h2 id="skillsLbl">${escapeHtml(labels.cv.skillsLbl)}</h2>
		          <ul id="skillsLst" class="cv-skill-details">
		            ${skillItems}
		          </ul>
		        </section>
		        <section aria-labelledby="experienceLbl" class="cv-section">
		          <h2 id="experienceLbl">${escapeHtml(labels.cv.experienceLbl)}</h2>
		          <div id="jobsLst" class="cv-entries">
		            ${jobs}
		          </div>
		        </section>
		        <section aria-labelledby="projectsLbl" class="cv-section">
		          <h2 id="projectsLbl">${escapeHtml(labels.cv.projectsLbl)}</h2>
		          <div id="projectsLst" class="cv-entries">
		            ${renderCvProjects(data)}
		          </div>
		        </section>
		        <section aria-labelledby="educationLbl" class="cv-section">
		          <h2 id="educationLbl">${escapeHtml(labels.cv.educationLbl)}</h2>
		          <section aria-labelledby="careersLbl" class="cv-subsection">
		            <h3 id="careersLbl">${escapeHtml(labels.cv.careersLbl)}</h3>
		            <div id="careersLst" class="cv-entries">
		              ${renderCvStudies(data, "career")}
		            </div>
		          </section>
		          <section aria-labelledby="coursesLbl" class="cv-subsection">
		            <h3 id="coursesLbl">${escapeHtml(labels.cv.coursesLbl)}</h3>
		            <div id="coursesLst" class="cv-entries">
		              ${renderCvStudies(data, "course")}
		            </div>
		          </section>
		          <section aria-labelledby="languagesLbl" class="cv-subsection">
		            <h3 id="languagesLbl">${escapeHtml(labels.cv.languagesLbl)}</h3>
		            <div id="languagesLst" class="cv-entries">
		              ${renderCvStudies(data, "language")}
		            </div>
		          </section>
		        </section>
		      </main>
		    </div>
		  </div>
		  ${renderFooter(data, "cv")}
		</body>
	`;

	return renderDocument(data, body, styles);
}
