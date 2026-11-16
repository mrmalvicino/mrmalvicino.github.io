import { escapeHtml, html, image } from "./html.mjs";

function renderProjectMedia(data, project) {
	if (project.video_url) {
		return html`
			<iframe src="${escapeHtml(project.video_url)}" title="${escapeHtml(data.locale.accessibility.videoPlayer)}"
			  frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			  referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
		`;
	}

	const imageData = data.images[project.mockup_id ?? "wipImg"];

	return image(imageData);
}

function renderProjectCard(data, project) {
	const technologyItems = project.technologies.map(technology => html`
		<li class="project-technology">
		  ${image(technology.image, "project-technology-icon")}
		</li>
	`).join("\n");

	const sourceButton = project.source_code ? html`
		<a href="${escapeHtml(project.source_code)}" target="_blank" rel="noopener noreferrer"
		  aria-label="${escapeHtml(`${data.locale.labels.common.sourceCodeLbl} (${data.locale.accessibility.newTab})`)}" class="transparent-button">
		  <i class="bi bi-code-slash" aria-hidden="true"></i>
		  <span>${escapeHtml(data.locale.labels.common.sourceCodeLbl)}</span>
		</a>
	` : "";

	const demoButton = project.live_demo ? html`
		<a href="${escapeHtml(project.live_demo)}" target="_blank" rel="noopener noreferrer"
		  aria-label="${escapeHtml(`${data.locale.labels.common.openOnlineLbl} (${data.locale.accessibility.newTab})`)}" class="transparent-button">
		  <i class="bi bi-eye" aria-hidden="true"></i>
		  <span>${escapeHtml(data.locale.labels.common.openOnlineLbl)}</span>
		</a>
	` : "";

	const websiteButton = project.website_url ? html`
		<a href="${escapeHtml(project.website_url)}" target="_blank" rel="noopener noreferrer"
		  aria-label="${escapeHtml(`${data.locale.labels.common.websiteLbl} (${data.locale.accessibility.newTab})`)}" class="transparent-button">
		  <i class="bi bi-globe2" aria-hidden="true"></i>
		  <span>${escapeHtml(data.locale.labels.common.websiteLbl)}</span>
		</a>
	` : "";

	return html`
		<article class="project-card" data-project-id="${escapeHtml(project.id)}"
		  data-technologies="${escapeHtml(project.technologyIds.join(" "))}" data-types="${escapeHtml(project.typeIds.join(" "))}"
		  data-participation-mode="${escapeHtml(project.participationMode.id)}">
		  <div class="project-top-div">
		    ${renderProjectMedia(data, project)}
		  </div>
		  <div class="project-details">
		    <div class="project-content">
		      <h3 class="pure-white-text">${escapeHtml(project.title)}</h3>
		      <p>${escapeHtml(project.description)}</p>
		    </div>
		    <div class="project-technologies">
		      <ul>
		        ${technologyItems}
		      </ul>
		    </div>
		    <div class="project-actions">
		      ${sourceButton}
		      ${demoButton}
		      ${websiteButton}
		    </div>
		  </div>
		</article>
	`;
}

export function renderProjects(data, projects) {
	return projects.map(project => renderProjectCard(data, project)).join("\n");
}
