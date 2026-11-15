import { renderDocument, route } from "./document.mjs";
import { formatStudyTitle } from "./formatters.mjs";
import { escapeHtml, html, image, publicUrl } from "./html.mjs";
import { renderProjects } from "./project-list.mjs";
import { renderEmailLink, renderFooter, renderJobSearch, renderNavbar } from "./site-chrome.mjs";

const styles = ["site-chrome.css", "portfolio.css", "project-cards.css", "inputs.css", "table.css"];
const scripts = ["menu.js", "email-copy.js"];

function renderSkillTechnologies(technologies) {
	return technologies.map(technology => html`
		<li class="skill-technology">
		  ${image(technology.image, "skill-technology-icon")}
		  <span>${escapeHtml(technology.name)}</span>
		</li>
	`).join("\n");
}

function renderSkillGroups(data) {
	return data.skillGroups.map(group => {
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

		if (study.study_plan) {
			links.push(html`
				<a href="${escapeHtml(publicUrl(study.study_plan))}" class="plain-link soft-black-link margin-10-px" aria-label="${escapeHtml(study.title)}">
				  <i class="bi bi-mortarboard mid-font-size" aria-hidden="true"></i>
				</a>
			`);
		}

		if (study.certificate) {
			links.push(html`
				<a href="${escapeHtml(publicUrl(study.certificate))}" class="plain-link soft-black-link margin-10-px" aria-label="${escapeHtml(study.title)}">
				  <i class="bi bi-award mid-font-size" aria-hidden="true"></i>
				</a>
			`);
		}

		if (links.length === 0) {
			links.push('<span class="margin-10-px" aria-hidden="true">&nbsp;</span>');
		}

		return html`
			<tr>
			  <td>
			    <div class="height-100-pct row-flex justify-center margin-horizontal-10-px">
			      ${image(study.institution.image, "small-logo")}
			    </div>
			  </td>
			  <td><span class="pure-black-text bold-text">${escapeHtml(formatStudyTitle(study, data.language))}</span></td>
			  <td>
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
		  <main>
		    <section id="heroSec" class="min-height-100-vh menu-padding col-flex justify-center">
		      ${image(data.images.profileImg, "width-250-px margin-vertical-10-px circle-image")}
		      <div class="content-width margin-vertical-10-px">
		        <h1>${escapeHtml(data.site.profile.fullName)}</h1>
		        <p class="mid-font-size jost-font center-text">${escapeHtml(labels.common.degreesLbl)}</p>
		      </div>
		      <p class="content-width margin-vertical-10-px center-text">${escapeHtml(labels.common.presentationLbl)}</p>
		      ${renderJobSearch(data, "content-width margin-vertical-10-px center-text bold-text")}
		      <div class="content-width margin-vertical-20-px col-flex justify-center">
		        <a id="resumeBtn" href="${escapeHtml(publicUrl(resume.href))}" download="${escapeHtml(resume.download)}" class="resume-download-button dark-button big-hover">
		          <i class="bi bi-download" aria-hidden="true"></i>
		          <span>&nbsp;</span>
		          <span>${escapeHtml(labels.index.resumeLbl)}</span>
		        </a>
		        <a id="onlineResumeBtn" href="${route(data.language, "cv")}" class="underlined-link soft-black-link margin-top-10-px">${escapeHtml(labels.index.onlineResumeLbl)}</a>
		      </div>
		    </section>
		    <section id="skillsSec" class="min-height-100-vh menu-padding col-flex justify-center gap-40-px">
		      <div class="content-width">
		        <h2 id="skillsLbl">${escapeHtml(labels.index.skillsLbl)}</h2>
		        <p class="skills-description center-text">${escapeHtml(data.skillDescription)}</p>
		      </div>
		      <div id="skillGroupsDiv" class="skill-groups-container">
		        ${renderSkillGroups(data)}
		      </div>
		    </section>
		    <section id="projectsSec" class="min-height-100-vh menu-padding gap-40-px col-flex space-evenly almost-black-background">
		      <div class="content-width">
		        <h2 id="projectsLbl" class="pure-white-text">${escapeHtml(labels.index.projectsLbl)}</h2>
		      </div>
		      <div id="projectsDiv" class="projects-container">
		        ${renderProjects(data, data.projects.filter(project => project.shown_in_portfolio))}
		      </div>
		      <div class="content-width row-col-800 justify-center">
		        <a href="${route(data.language, "projects")}" class="big-hover light-button">
		          <i class="bi bi-plus-circle" aria-hidden="true"></i>
		          <span>&nbsp;</span>
		          <span id="allProjectsLbl">${escapeHtml(labels.index.allProjectsLbl)}</span>
		        </a>
		      </div>
		    </section>
		    <section id="educationSec" class="min-height-100-vh menu-padding">
		      <div class="content-width light-box">
		        <h2 id="educationLbl" class="margin-bottom-20-px">${escapeHtml(labels.index.educationLbl)}</h2>
		        <table>
		          <tbody id="studiesTab">
		            ${renderStudyRows(data)}
		          </tbody>
		        </table>
		      </div>
		    </section>
		    <section id="contactSec" class="min-height-100-vh menu-padding almost-black-background">
		      <div class="content-width row-col-800 space-between gap-40-px">
		        <div class="width-100-pct margin-bottom-auto">
		          <h2 id="contactTitleLbl" class="left-text bold-text pure-white-text open-sans-font">${escapeHtml(labels.index.contactTitleLbl)}</h2>
		          <p id="contactDescriptionLbl" class="margin-top-10-px">${escapeHtml(labels.index.contactDescriptionLbl)}</p>
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
		          <form action="${escapeHtml(data.site.configuration.formAction)}" method="POST">
		            <div>
		              <label for="nameTxt" class="light-gray-text">${escapeHtml(labels.index.nameLbl)}</label>
		              <input type="text" id="nameTxt" name="nameTxt" required class="textbox-input" placeholder="${escapeHtml(data.locale.placeholders.nameTxt)}">
		              <label for="emailTxt" class="light-gray-text">${escapeHtml(labels.index.emailLbl)}</label>
		              <input type="email" id="emailTxt" name="emailTxt" required class="textbox-input" placeholder="${escapeHtml(data.locale.placeholders.emailTxt)}">
		              <label for="phoneTxt" class="light-gray-text">${escapeHtml(labels.index.phoneLbl)}</label>
		              <input type="tel" id="phoneTxt" name="phoneTxt" required class="textbox-input" placeholder="${escapeHtml(data.locale.placeholders.phoneTxt)}">
		              <label for="messageTxt" class="light-gray-text">${escapeHtml(labels.index.messageLbl)}</label>
		              <textarea id="messageTxt" name="messageTxt" rows="3" required class="textbox-input" placeholder="${escapeHtml(data.locale.placeholders.messageTxt)}"></textarea>
		              <button type="submit" id="submitBtn" class="light-button margin-top-10-px width-100-pct">${escapeHtml(data.locale.buttons.submitBtn)}</button>
		            </div>
		          </form>
		        </div>
		      </div>
		    </section>
		  </main>
		  ${renderFooter(data, "index")}
		</body>
	`;

	return renderDocument(data, body, styles, scripts);
}
