const commonStyles = [
	"constants.css",
	"buttons.css",
	"colors.css",
	"controls.css",
	"flexbox.css",
	"fonts.css",
	"heights.css",
	"images.css",
	"margins.css",
	"paddings.css",
	"widths.css"
];

export function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function attributes(values) {
	return Object.entries(values)
		.filter(([, value]) => value !== null && value !== undefined && value !== false)
		.map(([name, value]) => value === true ? name : `${name}="${escapeHtml(value)}"`)
		.join(" ");
}

function publicUrl(value) {
	if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(value)) {
		return value;
	}

	const url = new URL(value, "https://local.invalid/");

	return `${url.pathname}${url.search}${url.hash}`;
}

function image(imageData, className = "") {
	return `<img ${attributes({
		src: publicUrl(imageData.src),
		title: imageData.title,
		alt: imageData.alt,
		class: className || null
	})}>`;
}

function renderHead(data, styleFiles) {
	const styleLinks = styleFiles.map(file => `  <link rel="stylesheet" type="text/css" href="/style/${file}">`).join("\n");

	return `<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.site.profile.pageTitle)}</title>
  <link rel="icon" type="image/x-icon" href="/assets/images/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
${styleLinks}
</head>`;
}

function renderDocument(data, page, body) {
	const classAttribute = page === "cv" ? ' class="pale-black-background"' : "";
	const scripts = [
		page === "index" ? '<script src="/script/menu.js"></script>' : "",
		page === "projects" ? '<script src="/script/project-filters.js"></script>' : "",
		'<script src="/script/email-copy.js"></script>'
	].filter(Boolean).map(script => `  ${script}`).join("\n");
	const pageStyles = page === "index"
		? ["banner.css", ...commonStyles, "containers.css", "inputs.css", "menu.css", "table.css"]
		: page === "projects"
			? [...commonStyles, "containers.css", "menu.css", "projects.css"]
			: [...commonStyles, "cv.css"];

	return `<!DOCTYPE html>
<html lang="${escapeHtml(data.language)}"${classAttribute}>
${renderHead(data, pageStyles)}
${body}
${scripts}
</html>
`;
}

function route(language, page) {
	return `/${language}/${page === "index" ? "" : `${page}/`}`;
}

function renderLanguageLinks(page) {
	return `<nav aria-label="Language" class="row-flex width-100-px">
        <i class="bi bi-translate" aria-hidden="true"></i>
        <span>&nbsp;</span>
        <a href="${route("es", page)}" lang="es" class="plain-link medium-gray-link">ES</a>
        <span>&nbsp;/&nbsp;</span>
        <a href="${route("en", page)}" lang="en" class="plain-link medium-gray-link">EN</a>
      </nav>`;
}

export function renderLanguageRedirectPage() {
	return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maximiliano R. Malvicino</title>
  <script>
    const browserLanguage = navigator.languages?.[0] ?? navigator.language;
    window.location.replace(browserLanguage?.toLowerCase().startsWith("es") ? "/es/" : "/en/");
  </script>
</head>
<body>
  <nav aria-label="Language">
    <a href="/es/" lang="es">Español</a>
    <a href="/en/" lang="en">English</a>
  </nav>
</body>
</html>
`;
}

function renderEmailLink(data, className, iconClass = "") {
	const email = data.site.profile.email;

	return `<a href="${escapeHtml(email.href)}" data-copy-email="${escapeHtml(email.address)}"
          data-copy-message="${escapeHtml(data.locale.messages.emailCopied)}" class="${className}">
          <i class="bi bi-envelope${iconClass}" aria-hidden="true"></i>
          <span>&nbsp;</span>
          <span>${escapeHtml(email.address)}</span>
        </a>`;
}

function renderFooter(data, page) {
	const socialItems = data.socials.map(social => `          <li>
            <a href="${escapeHtml(social.href)}" target="_blank" rel="noreferrer"
              aria-label="${escapeHtml(social.label)}" class="plain-link medium-gray-link">
              <i class="bi bi-${escapeHtml(social.id)} big-font-size" aria-hidden="true"></i>
            </a>
          </li>`).join("\n");

	return `<footer id="footer" class="min-height-150-px padding-vertical-20-px align-content-center pale-black-background">
    <div class="content-width margin-horizontal-auto row-col-800 space-between gap-20-px">
      ${renderLanguageLinks(page)}
      <div>
        <ul class="row-flex gap-20-px">
${socialItems}
        </ul>
      </div>
      <div class="width-100-px">
        <a href="${escapeHtml(data.site.profile.location.href)}" target="_blank" rel="noreferrer"
          class="plain-link medium-gray-link margin-left-auto">
          <i class="bi bi-geo-alt" aria-hidden="true"></i>
          <span>&nbsp;${escapeHtml(data.locale.profile.footerLocation)}</span>
        </a>
      </div>
    </div>
  </footer>`;
}

function renderProjectMedia(data, project) {
	if (project.video_url) {
		return `<iframe src="${escapeHtml(project.video_url)}" title="${escapeHtml(data.locale.accessibility.videoPlayer)}"
          frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
	}

	const imageData = data.images[project.mockup_id ?? "wipImg"];

	return image(imageData);
}

function renderProjectCard(data, project) {
	const technologyItems = project.technologies.map(technology => `              <li class="project-technology">
                ${image(technology.image, "project-technology-icon")}
              </li>`).join("\n");
	const sourceButton = project.source_code ? `          <a href="${escapeHtml(project.source_code)}" class="transparent-button">
            <i class="bi bi-code-slash" style="margin-right: 5px" aria-hidden="true"></i>
            <span>${escapeHtml(data.locale.labels.common.sourceCodeLbl)}</span>
          </a>` : "";
	const demoButton = project.live_demo ? `          <a href="${escapeHtml(project.live_demo)}" class="transparent-button">
            <i class="bi bi-eye" style="margin-right: 5px" aria-hidden="true"></i>
            <span>${escapeHtml(data.locale.labels.common.openOnlineLbl)}</span>
          </a>` : "";

	return `      <article class="project-card" data-project-id="${escapeHtml(project.id)}"
        data-technologies="${escapeHtml(project.technologyIds.join(" "))}" data-types="${escapeHtml(project.typeIds.join(" "))}">
        <div class="project-top-div">
          ${renderProjectMedia(data, project)}
        </div>
        <div class="project-bot-div">
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
          </div>
        </div>
      </article>`;
}

function renderProjects(data, projects) {
	return projects.map(project => renderProjectCard(data, project)).join("\n");
}

function renderFilterOptions(items, group) {
	return items.map(item => `              <label class="project-filter-option">
                <input type="checkbox" name="${escapeHtml(group)}" value="${escapeHtml(item.id)}">
                <span>${escapeHtml(item.name)}</span>
              </label>`).join("\n");
}

function renderProjectFilters(data) {
	const labels = data.locale.labels.projects;
	const technologyIds = new Set(data.projects.flatMap(project => project.technologyIds));
	const typeIds = new Set(data.projects.flatMap(project => project.typeIds));
	const technologies = Object.values(data.technologies).filter(technology => technologyIds.has(technology.id));
	const projectTypes = Object.values(data.projectTypes).filter(projectType => typeIds.has(projectType.id));

	return `      <form id="projectFilters" class="project-filters" aria-labelledby="filtersLbl" hidden>
        <div class="project-filters-header">
          <h2 id="filtersLbl" class="pure-white-text">${escapeHtml(labels.filtersLbl)}</h2>
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
        </div>
      </form>`;
}

function renderPortfolioHeader(data) {
	const menu = data.menuItems.map(item => `          <li>
            <a href="${escapeHtml(item.href)}" class="plain-link medium-gray-link">${escapeHtml(item.label)}</a>
          </li>`).join("\n");

	return `<header class="menu-header">
    <nav id="menuNav" class="menu-nav" aria-label="${escapeHtml(data.locale.labels.projects.backLbl)}">
      <a id="logoBtn" href="${route(data.language, "index")}" class="plain-link pure-white-text margin-vertical-auto">
        ${image(data.images.logoImg, "width-40-px")}
        <span>&nbsp;</span>
        <span>${escapeHtml(data.site.profile.headerName)}</span>
      </a>
      <div>
        <ul id="menuLst">
${menu}
        </ul>
        <button id="toggleBtn" type="button" class="toggle-button" aria-label="Menu">
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>
      </div>
    </nav>
  </header>`;
}

function renderBanner(data) {
	const images = data.site.skills.bannerTechnologyIds.map(id => image(data.technologies[id].image, "width-100-px margin-10-px")).join("\n        ");
	const slide = `      <div class="banner-slide">
        ${images}
      </div>`;

	return `${slide}\n${slide}`;
}

function renderStacks(data) {
	return data.stacks.map(stack => {
		const items = stack.items.map(item => `          <li class="margin-vertical-10-px">${escapeHtml(item)}</li>`).join("\n");

		return `      <article class="stack-card">
        <h3 class="center-text jost-font">${escapeHtml(stack.title)}</h3>
        <ul>
${items}
        </ul>
      </article>`;
	}).join("\n");
}

function renderStudyRows(data) {
	return data.studies.map(study => {
		const links = [];

		if (study.study_plan) {
			links.push(`<a href="${escapeHtml(publicUrl(study.study_plan))}" class="plain-link soft-black-link margin-10-px" aria-label="${escapeHtml(study.title)}">
                  <i class="bi bi-mortarboard mid-font-size" aria-hidden="true"></i>
                </a>`);
		}

		if (study.certificate) {
			links.push(`<a href="${escapeHtml(publicUrl(study.certificate))}" class="plain-link soft-black-link margin-10-px" aria-label="${escapeHtml(study.title)}">
                  <i class="bi bi-award mid-font-size" aria-hidden="true"></i>
                </a>`);
		}

		if (links.length === 0) {
			links.push('<span class="margin-10-px" aria-hidden="true">&nbsp;</span>');
		}

		return `            <tr>
              <td>
                <div class="height-100-pct row-flex justify-center margin-horizontal-10-px">
                  ${image(study.institution.image, "small-logo")}
                </div>
              </td>
              <td><span class="pure-black-text bold-text">${escapeHtml(study.title)}</span></td>
              <td>
                <div class="row-flex justify-center">
                  ${links.join("\n                  ")}
                </div>
              </td>
            </tr>`;
	}).join("\n");
}

export function renderPortfolioPage(data) {
	const labels = data.locale.labels;
	const resume = data.site.resumes[data.language];
	const body = `<body class="open-sans-font light-gray-background">
  ${renderPortfolioHeader(data)}
  <main>
    <section id="heroSec" class="min-height-100-vh menu-padding col-flex justify-center">
      ${image(data.images.profileImg, "width-250-px margin-vertical-10-px circle-image")}
      <div class="content-width margin-vertical-10-px">
        <h1>${escapeHtml(data.site.profile.fullName)}</h1>
        <p class="mid-font-size jost-font center-text">${escapeHtml(labels.common.degreesLbl)}</p>
      </div>
      <p class="content-width margin-vertical-10-px center-text">${escapeHtml(labels.common.presentationLbl)}</p>
      <div class="content-width margin-vertical-20-px row-col-800 justify-center">
        <a id="resumeBtn" href="${escapeHtml(publicUrl(resume.href))}" download="${escapeHtml(resume.download)}" class="dark-button big-hover">
          <i class="bi bi-download" aria-hidden="true"></i>
          <span>&nbsp;</span>
          <span>${escapeHtml(labels.index.resumeLbl)}</span>
        </a>
      </div>
    </section>
    <section id="skillsSec" class="min-height-100-vh menu-padding col-flex space-evenly">
      <div class="content-width">
        <h2 id="skillsLbl">${escapeHtml(labels.index.skillsLbl)}</h2>
      </div>
      <div id="bannerDiv" class="banner-container">
${renderBanner(data)}
      </div>
      <div id="stacksDiv" class="row-col-1300 stacks-container">
${renderStacks(data)}
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
</body>`;

	return renderDocument(data, "index", body);
}

export function renderProjectsPage(data) {
	const backRoute = route(data.language, "index");
	const projectLabels = data.locale.labels.projects;
	const initialResultCount = `${data.projects.length} ${data.projects.length === 1
		? projectLabels.projectSingularLbl
		: projectLabels.projectPluralLbl}`;
	const body = `<body class="open-sans-font light-gray-background">
  <header class="menu-header">
    <nav class="menu-nav" aria-label="${escapeHtml(data.locale.labels.projects.backLbl)}">
      <a href="${backRoute}" class="plain-link pure-white-text margin-vertical-auto">
        ${image(data.images.logoImg, "width-40-px")}
        <span>&nbsp;</span>
        <span>${escapeHtml(data.site.profile.headerName)}</span>
      </a>
      <a href="${backRoute}" class="plain-link medium-gray-link">
        <i class="bi bi-arrow-left-short" aria-hidden="true"></i>
        <span>&nbsp;</span>
        <span id="backLbl">${escapeHtml(data.locale.labels.projects.backLbl)}</span>
      </a>
    </nav>
  </header>
  <main>
    <section id="projectsSec" class="min-height-100-vh menu-padding gap-40-px col-flex space-evenly almost-black-background">
      <div class="content-width">
        <h1 id="projectsLbl" class="pure-white-text margin-top-20-px">${escapeHtml(data.locale.labels.projects.projectsLbl)}</h1>
      </div>
${renderProjectFilters(data)}
      <p id="projectResultCount" class="project-result-count" aria-live="polite" aria-atomic="true"
        data-singular="${escapeHtml(projectLabels.projectSingularLbl)}" data-plural="${escapeHtml(projectLabels.projectPluralLbl)}">
        ${escapeHtml(initialResultCount)}
      </p>
      <div id="projectsDiv" class="projects-container">
${renderProjects(data, data.projects)}
      </div>
      <div id="projectEmptyState" class="project-empty-state" hidden>
        <i class="bi bi-filter-circle" aria-hidden="true"></i>
        <p>${escapeHtml(data.locale.messages.noProjects)}</p>
        <button type="button" class="light-button" data-clear-filters>${escapeHtml(projectLabels.clearFiltersLbl)}</button>
      </div>
    </section>
  </main>
  ${renderFooter(data, "projects")}
</body>`;

	return renderDocument(data, "projects", body);
}

function renderCvStudies(data, type) {
	return data.studies
		.filter(study => study.type === type && study.shown_in_cv)
		.map(study => `              <li class="margin-vertical-10-px">
                <h4>${escapeHtml(study.title)}</h4>
                <p>${escapeHtml(study.institution.name)}</p>
              </li>`)
		.join("\n");
}

function renderCvProjects(data) {
	return data.projects.filter(project => project.shown_in_cv).map(project => {
		const video = project.video_url
			? `\n                <a href="${escapeHtml(project.video_url)}" class="plain-link soft-black-text">${escapeHtml(project.video_url)}</a>`
			: "";
		const source = project.source_code
			? `\n                <a href="${escapeHtml(project.source_code)}" class="plain-link soft-black-text">${escapeHtml(project.source_code)}</a>`
			: "";

		return `              <li class="margin-vertical-20-px">
                <h4>${escapeHtml(project.title)}</h4>
                <p class="dark-gray-text">${escapeHtml(project.description)}</p>${video}${source}
              </li>`;
	}).join("\n");
}

export function renderCvPage(data) {
	const labels = data.locale.labels;
	const portfolioRoute = route(data.language, "index");
	const stackItems = data.stacks.map(stack => `          <li class="margin-vertical-10-px">
            <h3>${escapeHtml(stack.title)}</h3>
            <ul>
${stack.items.map(item => `              <li>${escapeHtml(item)}</li>`).join("\n")}
            </ul>
          </li>`).join("\n");
	const jobs = data.jobs.map(job => `              <li class="margin-vertical-20-px">
                <h4>${escapeHtml(job.position)}</h4>
                <p>${escapeHtml(job.organization)}</p>
                <p>${escapeHtml(job.time)}</p>
                <p class="dark-gray-text">${escapeHtml(job.description)}</p>
              </li>`).join("\n");
	const body = `<body class="open-sans-font cv-body light-gray-background">
  <header class="row-flex space-between almost-black-background cv-header">
    <div class="padding-20-px">
      ${image(data.images.profileImg, "width-250-px circle-image")}
    </div>
    <div class="height-100-pct col-flex space-between padding-20-px">
      <h1 class="pure-white-text">${escapeHtml(data.site.profile.fullName)}</h1>
      <p class="mid-font-size jost-font center-text pure-white-text">${escapeHtml(labels.common.degreesLbl)}</p>
      <p class="margin-vertical-5-px center-text">${escapeHtml(labels.common.presentationLbl)}</p>
      <div class="width-100-pct row-flex space-evenly">
        <a href="${portfolioRoute}" class="plain-link pure-white-text">
          <i class="bi bi-briefcase-fill mid-font-size" aria-hidden="true"></i>
          <span>&nbsp;${escapeHtml(data.site.profile.website.label)}</span>
        </a>
        <a href="${escapeHtml(data.site.profile.linkedin.href)}" target="_blank" rel="noreferrer" class="plain-link pure-white-text">
          <i class="bi bi-linkedin mid-font-size" aria-hidden="true"></i>
          <span>&nbsp;${escapeHtml(data.site.profile.linkedin.label)}</span>
        </a>
      </div>
    </div>
  </header>
  <main class="row-flex">
    <section id="leftColumnSec" class="light-gray-background cv-left-column">
      <div class="width-100-pct">
        <h2 id="skillsLbl" class="title-box">${escapeHtml(labels.cv.skillsLbl)}</h2>
        <ul id="skillsLst">
${stackItems}
        </ul>
      </div>
      <div class="width-100-pct margin-bottom-auto">
        <h2 id="educationLbl" class="title-box">${escapeHtml(labels.cv.educationLbl)}</h2>
        <section>
          <h3 id="careersLbl">${escapeHtml(labels.cv.careersLbl)}</h3>
          <ul id="careersLst">
${renderCvStudies(data, "career")}
          </ul>
        </section>
        <section>
          <h3 id="coursesLbl">${escapeHtml(labels.cv.coursesLbl)}</h3>
          <ul id="coursesLst">
${renderCvStudies(data, "course")}
          </ul>
        </section>
        <section>
          <h3 id="languagesLbl">${escapeHtml(labels.cv.languagesLbl)}</h3>
          <ul id="languagesLst">
${renderCvStudies(data, "language")}
          </ul>
        </section>
      </div>
    </section>
    <section id="rightColumnSec" class="light-gray-background cv-right-column">
      <div class="width-100-pct margin-bottom-auto">
        <h2 id="experienceLbl" class="title-box">${escapeHtml(labels.cv.experienceLbl)}</h2>
        <section>
          <h3 id="projectsLbl">${escapeHtml(labels.cv.projectsLbl)}</h3>
          <ul id="projectsLst">
${renderCvProjects(data)}
          </ul>
        </section>
        <section>
          <h3 id="jobsLbl">${escapeHtml(labels.cv.jobsLbl)}</h3>
          <ul id="jobsLst">
${jobs}
          </ul>
        </section>
      </div>
    </section>
  </main>
  <footer class="cv-footer almost-black-background">
    <div class="row-flex gap-20-px">
      ${renderEmailLink(data, "plain-link light-gray-text", " mid-font-size")}
      <a href="${escapeHtml(data.site.profile.phone.href)}" class="plain-link light-gray-text">
        <i class="bi bi-telephone mid-font-size" aria-hidden="true"></i>
        <span>&nbsp;</span>
        <span>${escapeHtml(data.site.profile.phone.label)}</span>
      </a>
    </div>
    ${renderLanguageLinks("cv")}
    <a href="${escapeHtml(data.site.profile.location.href)}" class="plain-link light-gray-text margin-left-auto">
      <i class="bi bi-geo-alt mid-font-size" aria-hidden="true"></i>
      <span>&nbsp;${escapeHtml(data.locale.profile.cvLocation)}</span>
    </a>
  </footer>
</body>`;

	return renderDocument(data, "cv", body);
}
