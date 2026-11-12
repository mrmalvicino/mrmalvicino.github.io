function copyToClipboard(event, text, successMessage) {
	event.preventDefault();

	navigator.clipboard.writeText(text)
		.then(() => {
			alert(successMessage + text);
		})
		.catch(err => {
			console.error("Error: ", err);
		});
}

function setLangAuto() {
    if (!getQueryParameters("lang") && getUserLang() !== getDefaultLang()) {
        redirecting = true;
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("lang", getUserLang());
        window.location.href = newUrl.toString();
    }

    document.documentElement.lang = getLang();
}

function getUserLang() {
    if (navigator.language.startsWith("en")) {
        return "en";
    }

    if (navigator.language.startsWith("es")) {
        return "es";
    }

    return getDefaultLang();
}

function getLang() {
    const urlParam = getQueryParameters("lang");

    if (urlParam === "es") {
        return "es";
    }

    if (urlParam === "en") {
        return "en";
    }

    return getDefaultLang();
}

function getDefaultLang() {
    return "es";
}

function getQueryParameters(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function keepQueryParameters() {
    const params = window.location.search;

    document.querySelectorAll("a").forEach(link => {
        if (link.href.startsWith(window.location.origin) && !link.href.includes("?")) {
            link.href += params;
        }
    });
}

function insertFooter() {
	return fetch("footer.html")
		.then(response => {
			if (!response.ok) {
				throw new Error(`No se pudo cargar footer.html: ${response.status}`);
			}

			return response.text();
		})
		.then(data => document.getElementById("footer").innerHTML = data);
}

// Gobal variables

let redirecting = false;

// Available in other JS files globally

window.setLangAuto = setLangAuto;
window.getLang = getLang;
window.keepQueryParameters = keepQueryParameters;
window.insertFooter = insertFooter;
window.copyToClipboard = copyToClipboard;
