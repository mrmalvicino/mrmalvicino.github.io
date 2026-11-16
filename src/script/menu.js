function closeMenu(returnFocus = false) {
	const menuNav = document.getElementById("menuNav");
	const toggleButton = document.getElementById("toggleBtn");
	const logoButton = document.getElementById("logoBtn");
	const icon = toggleButton.querySelector("i");

	if (menuNav.classList.contains("nav-toggle")) {
		menuNav.classList.remove("nav-toggle");
		logoButton.classList.remove("hidden");
		document.body.classList.remove("no-scroll");
		toggleButton.setAttribute("aria-expanded", "false");
		toggleButton.setAttribute("aria-label", toggleButton.dataset.openLabel);
		icon.classList.replace("bi-x-lg", "bi-list");

		if (returnFocus) {
			toggleButton.focus();
		}
	}
}

function toggleMenu() {
	const menuNav = document.getElementById("menuNav");
	const toggleButton = document.getElementById("toggleBtn");
	const logoButton = document.getElementById("logoBtn");
	const icon = toggleButton.querySelector("i");
	const isOpen = menuNav.classList.toggle("nav-toggle");

	logoButton.classList.toggle("hidden", isOpen);
	document.body.classList.toggle("no-scroll", isOpen);
	toggleButton.setAttribute("aria-expanded", String(isOpen));
	toggleButton.setAttribute("aria-label", isOpen ? toggleButton.dataset.closeLabel : toggleButton.dataset.openLabel);
	icon.classList.toggle("bi-list", !isOpen);
	icon.classList.toggle("bi-x-lg", isOpen);

	if (isOpen) {
		document.querySelector("#menuLst a").focus();
	}
}

const menuNav = document.getElementById("menuNav");
const toggleButton = document.getElementById("toggleBtn");
const menuList = document.getElementById("menuLst");
const mobileMenuMedia = window.matchMedia("(max-width: 1000px)");

toggleButton.addEventListener("click", event => {
	event.stopPropagation();
	toggleMenu();
});
menuList.addEventListener("click", () => closeMenu());
document.addEventListener("keydown", event => {
	if (event.key === "Escape") {
		closeMenu(true);
	}
});
window.addEventListener("resize", () => {
	if (!mobileMenuMedia.matches) {
		closeMenu(false);
	}
});
