import { renderDocument } from "./document.mjs";
import { escapeHtml, html } from "./html.mjs";
import { renderProjects } from "./project-list.mjs";
import { renderFooter, renderNavbar } from "./site-chrome.mjs";

function renderFilterOptions(items, group) {
	return items.map(item => html`
		<label class="project-filter-option">
		  <input type="checkbox" name="${escapeHtml(group)}" value="${escapeHtml(item.id)}">
		  <span>${escapeHtml(item.name)}</span>
		</label>
	`).join("\n");
}

function renderProjectFilters(data) {
	const labels = data.locale.labels.projects;
	const technologyIds = new Set(data.projects.flatMap(project => project.technologyIds));
	const typeIds = new Set(data.projects.flatMap(project => project.typeIds));
	const participationModeIds = new Set(data.projects.map(project => project.participationModeId));
	const technologies = Object.values(data.technologies).filter(technology => technologyIds.has(technology.id));
	const projectTypes = Object.values(data.projectTypes).filter(projectType => typeIds.has(projectType.id));

	const participationModes = Object.values(data.participationModes)
		.filter(participationMode => participationModeIds.has(participationMode.id));

	return html`
		<form id="project-filters" class="project-filters" aria-labelledby="filters-label" hidden>
		  <div class="project-filters-header">
		    <h2 id="filters-label" class="pure-white-text">${escapeHtml(labels.filtersLbl)}</h2>
		    <button type="button" class="project-filters-clear" data-clear-filters disabled>
		      ${escapeHtml(labels.clearFiltersLbl)}
		    </button>
		  </div>
		  <div class="project-filter-groups">
		    <fieldset class="project-filter-group" data-filter-group="tech">
		      <legend>${escapeHtml(labels.technologiesLbl)}</legend>
		      <div class="project-filter-options">
		        ${renderFilterOptions(technologies, "tech")}
		      </div>
		    </fieldset>
		    <fieldset class="project-filter-group" data-filter-group="type">
		      <legend>${escapeHtml(labels.typesLbl)}</legend>
		      <div class="project-filter-options">
		        ${renderFilterOptions(projectTypes, "type")}
		      </div>
		    </fieldset>
		    <fieldset class="project-filter-group" data-filter-group="contribution">
		      <legend>${escapeHtml(labels.contributionsLbl)}</legend>
		      <div class="project-filter-options">
		        ${renderFilterOptions(participationModes, "contribution")}
		      </div>
		    </fieldset>
		  </div>
		</form>
	`;
}

export function renderProjectsPage(data) {
	const projectLabels = data.locale.labels.projects;

	const initialResultCount = `${data.projects.length} ${data.projects.length === 1
		? projectLabels.projectSingularLbl
		: projectLabels.projectPluralLbl}`;

	const body = html`
		<body class="open-sans-font light-gray-background">
		  ${renderNavbar(data, "projects")}
		  <main id="main-content" tabindex="-1">
		    <section id="projects-sec" class="page-section min-height-100-vh menu-padding gap-40-px col-flex space-evenly almost-black-background">
		      <div class="content-width">
		        <h1 id="projects-label" class="pure-white-text margin-top-20-px">${escapeHtml(data.locale.labels.projects.projectsLbl)}</h1>
		      </div>
		      ${renderProjectFilters(data)}
		      <p id="project-result-count" class="project-result-count" aria-live="polite" aria-atomic="true"
		        data-singular="${escapeHtml(projectLabels.projectSingularLbl)}" data-plural="${escapeHtml(projectLabels.projectPluralLbl)}">
		        ${escapeHtml(initialResultCount)}
		      </p>
		      <div id="projects-list" class="projects-container">
		        ${renderProjects(data, data.projects)}
		      </div>
		      <div id="project-empty-state" class="project-empty-state" hidden>
		        <i class="bi bi-filter-circle" aria-hidden="true"></i>
		        <p>${escapeHtml(data.locale.messages.noProjects)}</p>
		        <button type="button" class="light-button" data-clear-filters>${escapeHtml(projectLabels.clearFiltersLbl)}</button>
		      </div>
		    </section>
		  </main>
		  ${renderFooter(data, "projects")}
		</body>
	`;

	return renderDocument(data, "projects", body);
}
