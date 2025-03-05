// Menu related

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

    if (menuNav.classList.contains("menu-active")) {
        menuNav.classList.remove("menu-active");
        toggleBtn.classList.remove("hidden");
        logoBtn.classList.remove("hidden");
        document.body.classList.remove("no-scroll");
    }
}

function toggleMenu() {
    const menuNav = document.getElementById("menuNav");
    menuNav.classList.toggle("menu-active");

    const toggleBtn = document.getElementById("toggleBtn");
    toggleBtn.classList.toggle("hidden");

    const logoBtn = document.getElementById("logoBtn");
    logoBtn.classList.toggle("hidden");

    document.body.classList.toggle("no-scroll", menuNav.classList.contains("menu-active"));
}

// Tools

function copyToClipboard(event, text) {
    event.preventDefault();
    const lang = getLang();

    navigator.clipboard.writeText(text).then(() => {
        if (lang === "es") {
            alert("Email copiado al portapapeles: " + text);
        }
        else if (lang === "en") {
            alert("Email copied to clipboard: " + text);
        }
    }).catch(err => {
        console.error("Error: ", err);
    });
}

function getLang() {
    const urlParam = getQueryParameters("lang");

    if (urlParam === "es") {
        return "es";
    }

    if (urlParam === "en") {
        return "en";
    }

    return "es";
}

function getQueryParameters(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Data binding

function bindCommonImages(commonData) {
    commonData.images.forEach(x => {
        const images = document.querySelectorAll(`[data-id="${x.id}"]`);

        images.forEach(y => {
            y.title = x.title;
            y.alt = x.alt;
            y.src = x.src;
        });
    });
}

function bindCommonLabels(commonData) {
    commonData.labels.forEach(x => {
        const images = document.querySelectorAll(`[data-id="${x.id}"]`);

        images.forEach(y => {
            y.textContent = x.text_content;
        });
    });
}

function bindUniqueImages(data) {
    data.images.forEach(x => {
        const image = document.getElementById(x.id);

        if (image) {
            image.title = x.title;
            image.alt = x.alt;
            image.src = x.src;
        }
    });
}

function bindUniqueLabels(data) {
    data.labels.forEach(x => {
        const label = document.getElementById(x.id);

        if (label) {
            label.textContent = x.text_content;
        }
    });
}

// Available in other JS files globally

window.defineMenuClosers = defineMenuClosers;
window.getLang = getLang;
window.bindCommonImages = bindCommonImages;
window.bindCommonLabels = bindCommonLabels;
window.bindUniqueImages = bindUniqueImages;
window.bindUniqueLabels = bindUniqueLabels;