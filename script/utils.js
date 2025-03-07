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

function keepQueryParameters() {
    const params = window.location.search;

    document.querySelectorAll("a").forEach(link => {
        if (link.href.startsWith(window.location.origin) && !link.href.includes("?")) {
            link.href += params;
        }
    });
}

function insertFooter() {
    fetch("footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("footer").innerHTML = data)
        .catch(error => console.error('Error al cargar el footer:', error));
}

// Available in other JS files globally

window.getLang = getLang;
window.keepQueryParameters = keepQueryParameters;
window.insertFooter = insertFooter;