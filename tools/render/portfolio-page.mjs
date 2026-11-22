import { route } from "../site-manifest.mjs";
import { renderDocument } from "./document.mjs";
import { formatStudyTitle } from "./formatters.mjs";
import { escapeHtml, html, image, publicUrl } from "./html.mjs";
import { renderProjects } from "./project-list.mjs";
import { renderEmailLink, renderFooter, renderJobSearch, renderNavbar } from "./site-chrome.mjs";

function renderSkillTechnologies(technologies) {
	return technologies.map(technology => html`
		<li class="skill-technology">
		  ${image(technology.image, "skill-technology-icon", { width: 24, height: 24, loading: "lazy", decoding: "async" })}
		  <span>${escapeHtml(technology.name)}</span>
		</li>
	`).join("\n");
}

function renderSkillGroups(data) {
	return data.skillGroups.filter(group => group.shownInPortfolio).map(group => {
		const content = group.categories
			? html`
				<ul class="skill-subcategories">
				  ${group.categories.map(category => html`
						<li class="skill-subcategory">
						  <h4>${escapeHtml(category.label)}</h4>
						  <ul class="skill-technologies">
						    ${renderSkillTechnologies(category.technologies)}
						  </ul>
						</li>
					`).join("\n")}
				</ul>
			`
			: html`
				<ul class="skill-technologies">
				  ${renderSkillTechnologies(group.technologies)}
				</ul>
			`;

		return html`
			<section class="skill-category">
			  <h3>${escapeHtml(group.label)}</h3>
			  ${content}
			</section>
		`;
	}).join("\n");
}

function renderStudyRows(data) {
	return data.studies.map(study => {
		const links = [];

		if (study.studyPlan) {
			links.push(html`
				<a href="${escapeHtml(publicUrl(study.studyPlan))}" target="_blank" rel="noopener noreferrer"
				  class="plain-link education-action-link soft-black-link margin-10-px"
				  aria-label="${escapeHtml(`${data.locale.accessibility.studyPlan}: ${study.title} (${data.locale.accessibility.newTab})`)}">
				  <i class="bi bi-mortarboard mid-font-size" aria-hidden="true"></i>
				</a>
			`);
		}

		if (study.certificate) {
			links.push(html`
				<a href="${escapeHtml(publicUrl(study.certificate))}" target="_blank" rel="noopener noreferrer"
				  class="plain-link education-action-link soft-black-link margin-10-px"
				  aria-label="${escapeHtml(`${data.locale.accessibility.certificateLink}: ${study.title} (${data.locale.accessibility.newTab})`)}">
				  <i class="bi bi-award mid-font-size" aria-hidden="true"></i>
				</a>
			`);
		}

		if (links.length === 0) {
			links.push('<span class="education-action-placeholder margin-10-px" aria-hidden="true">&nbsp;</span>');
		}

		return html`
			<tr class="education-row">
			  <td class="education-logo-cell">
			    <div class="height-100-pct row-flex justify-center margin-horizontal-10-px">
			      ${image(study.institution.image, "small-logo", { loading: "lazy", decoding: "async" })}
			    </div>
			  </td>
			  <th scope="row" class="education-description-cell"><span class="pure-black-text bold-text">${escapeHtml(formatStudyTitle(study, data.language))}</span></th>
			  <td class="education-actions-cell">
			    <div class="row-flex justify-center">
			      ${links.join("\n")}
			    </div>
			  </td>
			</tr>
		`;
	}).join("\n");
}

export function renderPortfolioPage(data) {
	const labels = data.locale.labels;
	const resume = data.site.resumes[data.language];

	const body = html`
		<body class="open-sans-font light-gray-background">
		  ${renderNavbar(data, "index")}
		  <main id="main-content" tabindex="-1">
		    <section id="hero-sec" class="page-section min-height-100-vh menu-padding col-flex justify-center">
		      ${image(data.images["profile-img"], "width-250-px margin-vertical-10-px circle-image", { fetchpriority: "high" })}
		      <div class="content-width margin-vertical-10-px">
		        <h1>${escapeHtml(data.site.profile.fullName)}</h1>
		        <p class="mid-font-size jost-font center-text">${escapeHtml(data.defaultProfessionalProfile.name)}</p>
		      </div>
		      <p class="content-width margin-vertical-10-px center-text">${escapeHtml(data.defaultProfessionalProfile.description)}</p>
		      ${renderJobSearch(data, "content-width margin-vertical-10-px center-text bold-text")}
		      <div class="content-width margin-vertical-20-px col-flex justify-center">
		        <a id="resume-btn" href="${escapeHtml(publicUrl(resume.href))}" download="${escapeHtml(resume.download)}" class="resume-download-button dark-button big-hover">
		          <i class="bi bi-download" aria-hidden="true"></i>
		          <span>&nbsp;</span>
		          <span>${escapeHtml(labels.index.resumeLbl)}</span>
		        </a>
		        <a id="online-resume-btn" href="${route(data.language, "cv")}" class="underlined-link soft-black-link margin-top-10-px">${escapeHtml(labels.index.onlineResumeLbl)}</a>
		      </div>
		    </section>
		    <section id="skills-sec" class="page-section min-height-100-vh menu-padding col-flex justify-center gap-40-px">
		      <div class="content-width">
		        <h2 id="skills-label">${escapeHtml(labels.index.skillsLbl)}</h2>
		        <p class="skills-description center-text">${escapeHtml(data.skillDescription)}</p>
		      </div>
		      <div id="skill-groups" class="skill-groups-container">
		        ${renderSkillGroups(data)}
		      </div>
		    </section>
		    <section id="projects-sec" class="page-section min-height-100-vh menu-padding gap-40-px col-flex space-evenly almost-black-background">
		      <div class="content-width">
		        <h2 id="projects-label" class="pure-white-text">${escapeHtml(labels.index.projectsLbl)}</h2>
		      </div>
		      <div id="projects-list" class="projects-container">
		        ${renderProjects(data, data.projects.filter(project => project.shownInPortfolio))}
		      </div>
		      <div class="content-width row-col-800 justify-center">
		        <a href="${route(data.language, "projects")}" class="big-hover light-button">
		          <i class="bi bi-plus-circle" aria-hidden="true"></i>
		          <span>&nbsp;</span>
		          <span id="all-projects-label">${escapeHtml(labels.index.allProjectsLbl)}</span>
		        </a>
		      </div>
		    </section>
		    <section id="education-sec" class="page-section min-height-100-vh menu-padding">
		      <div class="content-width education-panel">
		        <h2 id="education-label" class="margin-bottom-20-px">${escapeHtml(labels.index.educationLbl)}</h2>
		        <table class="education-table" aria-labelledby="education-label">
		          <thead class="visually-hidden">
		            <tr>
		              <th scope="col">${escapeHtml(data.locale.accessibility.institution)}</th>
		              <th scope="col">${escapeHtml(data.locale.accessibility.study)}</th>
		              <th scope="col">${escapeHtml(data.locale.accessibility.documents)}</th>
		            </tr>
		          </thead>
		          <tbody id="studies-table">
		            ${renderStudyRows(data)}
		          </tbody>
		        </table>
		      </div>
		    </section>
		    <section id="contact-sec" class="page-section min-height-100-vh menu-padding almost-black-background">
		      <div class="content-width row-col-800 space-between gap-40-px">
		        <div class="width-100-pct margin-bottom-auto">
		          <h2 id="contact-title" class="left-text bold-text pure-white-text open-sans-font">${escapeHtml(labels.index.contactTitleLbl)}</h2>
		          <p id="contact-description" class="margin-top-10-px">${escapeHtml(labels.index.contactDescriptionLbl)}</p>
		          <div class="wrapped-flex justify-center">
		            ${renderEmailLink(data, "plain-link light-gray-text margin-10-px")}
		            <a href="${escapeHtml(data.site.profile.phone.href)}" class="plain-link light-gray-text margin-10-px">
		              <i class="bi bi-telephone" aria-hidden="true"></i>
		              <span>&nbsp;</span>
		              <span>${escapeHtml(data.site.profile.phone.label)}</span>
		            </a>
		          </div>
		        </div>
		        <div class="width-100-pct">
		          <form action="${escapeHtml(data.site.configuration.formAction)}" method="POST" data-contact-form
		            data-submitting-message="${escapeHtml(data.locale.messages.formSubmitting)}"
		            data-success-message="${escapeHtml(data.locale.messages.formSuccess)}"
		            data-server-error-message="${escapeHtml(data.locale.messages.formServerError)}"
		            data-network-error-message="${escapeHtml(data.locale.messages.formNetworkError)}">
		            <p id="required-fields-note" class="form-instructions">${escapeHtml(data.locale.accessibility.requiredFields)}</p>
		            <div>
		              <label for="name-input" class="light-gray-text">${escapeHtml(labels.index.nameLbl)} *</label>
		              <input type="text" id="name-input" name="name-input" autocomplete="name" required aria-describedby="required-fields-note"
		                class="textbox-input" placeholder="${escapeHtml(data.locale.placeholders.nameTxt)}">
		              <label for="email-input" class="light-gray-text">${escapeHtml(labels.index.emailLbl)} *</label>
		              <input type="email" id="email-input" name="email-input" autocomplete="email" required aria-describedby="required-fields-note"
		                class="textbox-input" placeholder="${escapeHtml(data.locale.placeholders.emailTxt)}">
		              <label for="phone-input" class="light-gray-text">${escapeHtml(labels.index.phoneLbl)} *</label>
		              <input type="tel" id="phone-input" name="phone-input" autocomplete="tel" required aria-describedby="required-fields-note"
		                class="textbox-input" placeholder="${escapeHtml(data.locale.placeholders.phoneTxt)}">
		              <label for="message-input" class="light-gray-text">${escapeHtml(labels.index.messageLbl)} *</label>
		              <textarea id="message-input" name="message-input" rows="3" required aria-describedby="required-fields-note"
		                class="textbox-input" placeholder="${escapeHtml(data.locale.placeholders.messageTxt)}"></textarea>
		              <button type="submit" id="submit-btn" class="light-button margin-top-10-px width-100-pct">${escapeHtml(data.locale.buttons.submitBtn)}</button>
		              <p class="form-status" data-form-status aria-live="polite"></p>
		            </div>
		          </form>
		        </div>
		      </div>
		    </section>
		  </main>
		  ${renderFooter(data, "index")}
		</body>
	`;

	return renderDocument(data, "index", body);
}
