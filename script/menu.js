function defineMenuClosers() {
    const menuNav = document.getElementById("menuNav");
    closesMenu(menuNav);

    const toggleBtn = document.getElementById("toggleBtn");
    toggleBtn.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();
        }
    );

    window.addEventListener(
        "resize",
        function () {
            if (window.innerWidth >= 1000) {
                closeMenu();
            }
        }
    );
}

function closesMenu(clickable) {
    clickable.addEventListener("click", closeMenu);
}

function closeMenu() {
    const menuNav = document.getElementById("menuNav");
    const toggleBtn = document.getElementById("toggleBtn");
    const logoBtn = document.getElementById("logoBtn");

    if (menuNav.classList.contains("nav-toggle")) {
        menuNav.classList.remove("nav-toggle");
        toggleBtn.classList.remove("hidden");
        logoBtn.classList.remove("hidden");
        document.body.classList.remove("no-scroll");
    }
}

function toggleMenu() {
    const menuNav = document.getElementById("menuNav");
    menuNav.classList.toggle("nav-toggle");

    const toggleBtn = document.getElementById("toggleBtn");
    toggleBtn.classList.toggle("hidden");

    const logoBtn = document.getElementById("logoBtn");
    logoBtn.classList.toggle("hidden");

    document.body.classList.toggle("no-scroll", menuNav.classList.contains("nav-toggle"));
}

// Available in other JS files globally

window.defineMenuClosers = defineMenuClosers;