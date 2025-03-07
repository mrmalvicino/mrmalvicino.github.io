// Images

function bindUniqueImages(images) {
    images.forEach(x => {
        const image = document.getElementById(x.id);

        if (image) {
            image.title = x.title;
            image.alt = x.alt;
            image.src = x.src;
        }
    });
}

function bindCommonImages(images) {
    images.forEach(x => {
        const images = document.querySelectorAll(`[data-id="${x.id}"]`);

        images.forEach(y => {
            y.title = x.title;
            y.alt = x.alt;
            y.src = x.src;
        });
    });
}

// Labels

function bindUniqueLabels(labels) {
    labels.forEach(x => {
        const label = document.getElementById(x.id);

        if (label) {
            label.textContent = x.text_content;
        }
    });
}

function bindCommonLabels(labels) {
    labels.forEach(x => {
        const images = document.querySelectorAll(`[data-id="${x.id}"]`);

        images.forEach(y => {
            y.textContent = x.text_content;
        });
    });
}

// Textboxes

function bindTextboxes(textboxes) {
    textboxes.forEach(x => {
        const textbox = document.getElementById(x.id);

        if (textbox) {
            textbox.placeholder = x.placeholder;
        }
    });

    document.getElementById("messageTxt").value = "";
}

// Buttons

function bindButtons(buttons) {
    buttons.a_items.forEach(x => {
        const a = document.getElementById(x.id);
        a.href = x.href;
        a.download = x.download;
    });

    buttons.button_items.forEach(x => {
        const button = document.getElementById(x.id);
        button.innerHTML = "";
        button.textContent = x.text_content;
    });
}

// Available in other JS files globally

window.bindUniqueImages = bindUniqueImages;
window.bindCommonImages = bindCommonImages;
window.bindUniqueLabels = bindUniqueLabels;
window.bindCommonLabels = bindCommonLabels;
window.bindTextboxes = bindTextboxes;
window.bindButtons = bindButtons;