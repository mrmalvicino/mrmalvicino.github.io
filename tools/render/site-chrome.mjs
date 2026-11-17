import { route } from "./document.mjs";
import { escapeHtml, html, image } from "./html.mjs";

function renderLanguageLinks(data, page) {
	return html`
		<nav aria-label="${escapeHtml(data.locale.accessibility.languageNavigation)}" class="row-flex width-100-px">
		  <i class="bi bi-translate" aria-hidden="true"></i>
		  <span>&nbsp;</span>
		  <a href="${route("es", page)}" lang="es" class="plain-link medium-gray-link">ES</a>
		  <span>&nbsp;/&nbsp;</span>
		  <a href="${route("en", page)}" lang="en" class="plain-link medium-gray-link">EN</a>
		</nav>
	`;
}

export function renderEmailLink(data, className, iconClass = "") {
	const email = data.site.profile.email;

	return html`
		<a href="${escapeHtml(email.href)}" data-copy-email="${escapeHtml(email.address)}"
		  data-copy-message="${escapeHtml(data.locale.messages.emailCopied)}"
		  data-copy-failure="${escapeHtml(data.locale.messages.emailCopyFailed)}" class="${className}">
		  <i class="bi bi-envelope${iconClass}" aria-hidden="true"></i>
		  <span>&nbsp;</span>
		  <span>${escapeHtml(email.address)}</span>
		</a>
		<span class="visually-hidden" role="status" aria-live="polite" data-copy-status></span>
	`;
}

export function renderFooter(data, page) {
	const socialItems = data.socials.map(social => html`
		<li>
		  <a href="${escapeHtml(social.href)}" target="_blank" rel="noopener noreferrer"
		    aria-label="${escapeHtml(`${social.label} (${data.locale.accessibility.newTab})`)}" class="plain-link medium-gray-link">
		    <i class="bi bi-${escapeHtml(social.id)} big-font-size" aria-hidden="true"></i>
		  </a>
		</li>
	`).join("\n");

	return html`
		<footer id="footer" class="site-chrome min-height-150-px padding-vertical-20-px align-content-center pale-black-background">
		  <div class="content-width margin-horizontal-auto gap-20-px footer-content">
		    ${renderLanguageLinks(data, page)}
		    <nav aria-label="${escapeHtml(data.locale.navigation.main)}" class="footer-pages">
		      <a href="${route(data.language, "index")}" class="plain-link medium-gray-link">${escapeHtml(data.locale.navigation.portfolio)}</a>
		      <a href="${route(data.language, "projects")}" class="plain-link medium-gray-link">${escapeHtml(data.locale.navigation.projects)}</a>
		      <a href="${route(data.language, "cv")}" class="plain-link medium-gray-link">${escapeHtml(data.locale.navigation.cv)}</a>
		    </nav>
		    <div class="footer-socials">
		      <ul class="row-flex gap-20-px">
		        ${socialItems}
		      </ul>
		    </div>
		    <div class="footer-location">
		      <a href="${escapeHtml(data.site.profile.location.href)}" target="_blank" rel="noopener noreferrer"
		        aria-label="${escapeHtml(`${data.locale.profile.footerLocation} (${data.locale.accessibility.newTab})`)}"
		        class="plain-link medium-gray-link margin-left-auto">
		        <i class="bi bi-geo-alt" aria-hidden="true"></i>
		        <span>&nbsp;${escapeHtml(data.locale.profile.footerLocation)}</span>
		      </a>
		    </div>
		  </div>
		</footer>
	`;
}

export function renderJobSearch(data, className) {
	if (!data.site.profile.jobSearchActive) {
		return "";
	}

	return `<p id="jobSearchLbl" class="${className}">${escapeHtml(data.locale.labels.common.jobSearchLbl)}</p>`;
}

export function renderNavbar(data, page) {
	const isPortfolio = page === "index";

	const navigation = isPortfolio
		? html`
			<div>
			  <ul id="menuLst">
			    ${data.menuItems.map(item => html`
					<li>
					  <a href="${escapeHtml(item.href)}" class="plain-link medium-gray-link">${escapeHtml(item.label)}</a>
					</li>
				`).join("\n")}
			  </ul>
			  <button id="toggleBtn" type="button" class="toggle-button"
			    aria-label="${escapeHtml(data.locale.accessibility.openMenu)}" aria-expanded="false" aria-controls="menuLst"
			    data-open-label="${escapeHtml(data.locale.accessibility.openMenu)}"
			    data-close-label="${escapeHtml(data.locale.accessibility.closeMenu)}">
			    <i class="bi bi-list" aria-hidden="true"></i>
			  </button>
			</div>
		`
		: html`
			<a id="backLbl" href="${route(data.language, "index")}" class="plain-link medium-gray-link">
			  <i class="bi bi-arrow-left-short" aria-hidden="true"></i>
			  <span>&nbsp;</span>
			  <span>${escapeHtml(data.locale.labels.projects.backLbl)}</span>
			</a>
		`;

	return html`
		<a href="#main-content" class="skip-link">${escapeHtml(data.locale.accessibility.skipToContent)}</a>
		<header class="site-chrome menu-header">
		  <nav${isPortfolio ? ' id="menuNav"' : ""} class="menu-nav" aria-label="${escapeHtml(data.locale.accessibility.primaryNavigation)}">
		    <a id="logoBtn" href="${route(data.language, "index")}" class="plain-link pure-white-text margin-vertical-auto">
		      ${image(data.images.logoImg, "width-40-px", { width: 40, height: 40, decoding: "async" })}
		      <span>&nbsp;</span>
		      <span>${escapeHtml(data.site.profile.headerName)}</span>
		    </a>
		    ${navigation}
		  </nav>
		</header>
	`;
}
