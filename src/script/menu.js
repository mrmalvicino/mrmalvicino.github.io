function closeMenu() {
	const menuNav = document.getElementById("menuNav");
	const toggleButton = document.getElementById("toggleBtn");
	const logoButton = document.getElementById("logoBtn");

	if (menuNav.classList.contains("nav-toggle")) {
		menuNav.classList.remove("nav-toggle");
		toggleButton.classList.remove("hidden");
		logoButton.classList.remove("hidden");
		document.body.classList.remove("no-scroll");
	}
}

function toggleMenu() {
	const menuNav = document.getElementById("menuNav");
	const toggleButton = document.getElementById("toggleBtn");
	const logoButton = document.getElementById("logoBtn");

	menuNav.classList.toggle("nav-toggle");
	toggleButton.classList.toggle("hidden");
	logoButton.classList.toggle("hidden");
	document.body.classList.toggle("no-scroll", menuNav.classList.contains("nav-toggle"));
}

const menuNav = document.getElementById("menuNav");
const toggleButton = document.getElementById("toggleBtn");

toggleButton.addEventListener("click", event => {
	event.stopPropagation();
	toggleMenu();
});
menuNav.addEventListener("click", closeMenu);
window.addEventListener("resize", () => {
	if (window.innerWidth >= 1000) {
		closeMenu();
	}
});
