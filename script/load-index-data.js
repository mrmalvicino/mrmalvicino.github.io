document.addEventListener("DOMContentLoaded", () => {
    const lang = getLang();
    const indexData = `data/index-${lang}.json`;
    const commonData = `data/common-${lang}.json`;

    Promise.all([
        fetch(indexData).then(response => response.json()),
        fetch(commonData).then(response => response.json())
    ])
        .then(([indexData, commonData]) => {
            renderPage(indexData);
            bindIndexElements(indexData);
            bindCommonElements(commonData);
        })
        .catch(error => console.error(`Error al cargar index-${lang}.json y common-${lang}.json:`, error));
});

function renderPage(indexData) {
    renderMenu(indexData);
    renderBanner(indexData);
    renderStacks(indexData);
    renderProjects(indexData);
    renderCareers(indexData);
}

function bindIndexElements(indexData) {
    bindUniqueImages(indexData);
    bindUniqueLabels(indexData);
    bindTextboxes(indexData);
    bindButtons(indexData);
}

function bindCommonElements(commonData) {
    bindCommonImages(commonData);
    bindCommonLabels(commonData);
}

function renderMenu(indexData) {
    const ul = document.getElementById("menuLst");
    ul.innerHTML = "";

    indexData.menu_items.forEach(x => {
        const li = document.createElement("li");
        const a = document.createElement("a");

        a.href = x.href;
        a.textContent = x.label;
        a.classList.add("invisible-link");

        li.appendChild(a);
        ul.appendChild(li);
    });
}

function renderBanner(indexData) {
    const banner = document.getElementById("bannerDiv");
    banner.innerHTML = "";

    for (let i = 0; i < 4; i++) {
        const slideDiv = document.createElement("div");
        slideDiv.classList.add("banner-slide");

        indexData.banner_ids.forEach(x => {
            const img = document.createElement("img");
            img.setAttribute("data-id", x);
            img.classList.add("width-100-px", "margin-10-px");
            slideDiv.appendChild(img);
        });

        banner.appendChild(slideDiv);
    }
}

function renderStacks(indexData) {
    const stacks = document.getElementById("stacksDiv");
    stacks.innerHTML = "";

    indexData.stacks.forEach(x => {
        const div = document.createElement("div");
        div.classList.add("stack-div");

        const h3 = document.createElement("h3");
        h3.textContent = x.title;
        div.appendChild(h3);

        const ul = document.createElement("ul");

        x.items.forEach(y => {
            const li = document.createElement("li");
            li.textContent = y;
            ul.appendChild(li);
        });

        div.appendChild(ul);

        stacks.appendChild(div);
    });
}

function renderProjects(indexData) {
    const projects = document.getElementById("projectsDiv");
    projects.innerHTML = "";

    indexData.projects.forEach(x => {
        const container = document.createElement("div");
        container.classList.add("project-div");

        // Video o mockup
        const coverDiv = document.createElement("div");
        coverDiv.classList.add("cover-div");

        if (x.video_url) {
            const iframe = document.createElement("iframe");
            iframe.setAttribute("src", x.video_url);
            iframe.setAttribute("title", "YouTube video player");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
            iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
            iframe.setAttribute("allowfullscreen", "true");
            coverDiv.appendChild(iframe);
        }
        else if (x.mockup_id) {
            const img = document.createElement("img");
            img.id = x.mockup_id;
            coverDiv.appendChild(img);
        }
        else {
            const img = document.createElement("img");
            img.setAttribute("data-id", "wipImg");
            coverDiv.appendChild(img);
        }

        container.appendChild(coverDiv);

        // Contenido
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("padding-0-20-px", "height-300-px", "col-flex", "space-between");

        // Contenido: Título y descripción
        const textDiv = document.createElement("div");
        textDiv.classList.add("margin-10-0-px");

        const h3 = document.createElement("h3");
        h3.textContent = x.title;
        textDiv.appendChild(h3);

        const p = document.createElement("p");
        p.textContent = x.description;
        textDiv.appendChild(p);

        contentDiv.appendChild(textDiv);

        // Contenido: Tecnologías
        const technologiesDiv = document.createElement("div");
        const ul = document.createElement("ul");
        ul.classList.add("row-flex", "justify-center");

        x.technologies_ids.forEach(y => {
            const li = document.createElement("li");
            const img = document.createElement("img");
            img.setAttribute("data-id", y);
            img.classList.add("width-40-px", "margin-10-px");
            li.appendChild(img);
            ul.appendChild(li);
        });

        technologiesDiv.appendChild(ul);
        contentDiv.appendChild(technologiesDiv);

        // Contenido: Botones
        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("row-flex", "justify-center", "padding-bottom-10-px");

        if (x.source_code) {
            const a1 = document.createElement("a");
            a1.href = x.source_code;
            a1.classList.add("dark-button", "margin-10-px");

            const i1 = document.createElement("i");
            i1.classList.add("bi", "bi-code-slash");
            i1.style.marginRight = "5px";

            const span1 = document.createElement("span");
            span1.setAttribute("data-id", "sourceCodeLbl");

            a1.appendChild(i1);
            a1.appendChild(span1);
            buttonsDiv.appendChild(a1);
        }

        if (x.live_demo) {
            const a2 = document.createElement("a");
            a2.href = x.live_demo;
            a2.classList.add("dark-button", "margin-10-px");

            const i2 = document.createElement("i");
            i2.classList.add("bi", "bi-eye");
            i2.style.marginRight = "5px";

            const span2 = document.createElement("span");
            span2.setAttribute("data-id", "openOnlineLbl");

            a2.appendChild(i2);
            a2.appendChild(span2);
            buttonsDiv.appendChild(a2);
        }

        contentDiv.appendChild(buttonsDiv);
        container.appendChild(contentDiv);

        // Agregar proyecto

        projects.appendChild(container);
    });
}

function renderCareers(indexData) {
    const tbody = document.getElementById("careersTab");
    tbody.innerHTML = "";

    indexData.careers.forEach(x => {
        const tr = document.createElement("tr");

        // Institución
        const institution = document.createElement("td");
        const img = document.createElement("img");
        img.setAttribute("data-id", x.institution_id);
        img.classList.add("height-30-px");
        institution.appendChild(img);
        tr.appendChild(institution);

        // Carrera
        const career = document.createElement("td");
        const span = document.createElement("span");
        span.textContent = x.title;
        career.appendChild(span);
        tr.appendChild(career);

        // Acciones
        const actions = document.createElement("td");
        const buttonsDiv = document.createElement("div");

        if (x.study_plan) {
            const a1 = document.createElement("a");
            a1.href = x.study_plan;
            a1.classList.add("link-button", "margin-10-px");

            const i1 = document.createElement("i");
            i1.classList.add("bi", "bi-mortarboard", "mid-font-size");
            a1.appendChild(i1);

            buttonsDiv.appendChild(a1);
        }

        if (x.certificate) {
            const a2 = document.createElement("a");
            a2.href = x.certificate;
            a2.classList.add("link-button", "margin-10-px");

            const i2 = document.createElement("i");
            i2.classList.add("bi", "bi-award", "mid-font-size");
            a2.appendChild(i2);

            buttonsDiv.appendChild(a2);
        }

        if (!x.study_plan && !x.certificate) {
            actions.textContent = "N/A";
        }
        else {
            actions.appendChild(buttonsDiv);
        }

        // Agregar carrera

        tr.appendChild(actions);
        tbody.appendChild(tr);
    });
}

function bindTextboxes(indexData) {
    indexData.textboxes.forEach(x => {
        const textbox = document.getElementById(x.id);

        if (textbox) {
            textbox.placeholder = x.placeholder;
        }
    });
}

function bindButtons(indexData) {
    // Descargar CV
    const a = document.getElementById("resumeBtn");
    a.href = indexData.buttons[0].href;
    a.download = indexData.buttons[0].download;

    // Enviar formulario
    const button = document.getElementById("submitBtn");
    button.innerHTML = "";
    button.textContent = indexData.buttons[1].text_content;
}