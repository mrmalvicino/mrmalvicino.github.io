document.addEventListener(
    "DOMContentLoaded",
    function () {
        fetchIndexData();
        fetchFooter();
        defineMenuClosers();
    }
);

function fetchIndexData() {
    const lang = getLang();
    const indexDataUrl = `data/index-${lang}.json`;
    const commonDataUrl = `data/common-${lang}.json`;
    const projectsDataUrl = `data/projects-${lang}.json`;

    Promise.all([
        fetch(indexDataUrl).then(response => response.json()),
        fetch(commonDataUrl).then(response => response.json()),
        fetch(projectsDataUrl).then(response => response.json())
    ])
        .then(([indexData, commonData, projectsData]) => {
            renderIndexData(indexData);
            renderProjects(projectsData);
            renderCommonData(commonData);
        })
        .catch(error => console.error(`Error al cargar los archivos JSON:`, error));
}

function renderIndexData(indexData) {
    renderMenu(indexData);
    renderBanner(indexData);
    renderStacks(indexData);
    renderCareers(indexData);
    bindUniqueImages(indexData);
    bindUniqueLabels(indexData);
    bindTextboxes(indexData);
    bindButtons(indexData);
}

function renderCommonData(commonData) {
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
        a.classList.add("plain-link", "medium-gray-link");

        li.appendChild(a);
        ul.appendChild(li);
    });
}

function renderBanner(indexData) {
    const banner = document.getElementById("bannerDiv");
    banner.innerHTML = "";

    for (let i = 0; i < 2; i++) {
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
        div.classList.add("stack-card");

        const h3 = document.createElement("h3");
        h3.textContent = x.title;
        h3.classList.add("center-text", "jost-font");
        div.appendChild(h3);

        const ul = document.createElement("ul");

        x.items.forEach(y => {
            const li = document.createElement("li");
            li.textContent = y;
            li.classList.add("margin-10-0-px");
            ul.appendChild(li);
        });

        div.appendChild(ul);

        stacks.appendChild(div);
    });
}

function renderProjects(projectsData) {
    const portfolioProjects = projectsData.projects.filter(x => x.shown_in_portfolio);

    const projects = document.getElementById("projectsDiv");
    projects.innerHTML = "";

    portfolioProjects.forEach(x => {
        const container = document.createElement("div");
        container.classList.add("project-card");

        // Top Div
        const topDiv = document.createElement("div");
        topDiv.classList.add("project-top-div");

        if (x.video_url) {
            const iframe = document.createElement("iframe");
            iframe.setAttribute("src", x.video_url);
            iframe.setAttribute("title", "YouTube video player");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
            iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
            iframe.setAttribute("allowfullscreen", "true");
            topDiv.appendChild(iframe);
        }
        else if (x.mockup_id) {
            const img = document.createElement("img");
            img.id = x.mockup_id;
            topDiv.appendChild(img);
        }
        else {
            const img = document.createElement("img");
            img.setAttribute("data-id", "wipImg");
            topDiv.appendChild(img);
        }

        container.appendChild(topDiv);

        // Bottom Div
        const bottomDiv = document.createElement("div");
        bottomDiv.classList.add("project-bot-div");

        // Título y descripción
        const textDiv = document.createElement("div");
        textDiv.classList.add("margin-10-px");

        const h3 = document.createElement("h3");
        h3.textContent = x.title;
        h3.classList.add("pure-white-text");
        textDiv.appendChild(h3);

        const p = document.createElement("p");
        p.textContent = x.description;
        textDiv.appendChild(p);

        bottomDiv.appendChild(textDiv);

        // Tecnologías
        const technologiesDiv = document.createElement("div");
        technologiesDiv.classList.add("width-100-pct", "padding-0-10-px");
        const ul = document.createElement("ul");
        ul.classList.add("row-flex", "space-around");

        x.technologies_ids.forEach(y => {
            const li = document.createElement("li");
            const img = document.createElement("img");
            img.setAttribute("data-id", y);
            img.classList.add("width-30-px");
            li.appendChild(img);
            ul.appendChild(li);
        });

        technologiesDiv.appendChild(ul);
        bottomDiv.appendChild(technologiesDiv);

        // Botones
        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("row-flex", "width-100-pct", "justify-center");

        if (x.source_code) {
            const a1 = document.createElement("a");
            a1.href = x.source_code;
            a1.classList.add("transparent-button", "margin-10-px");

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
            a2.classList.add("transparent-button", "margin-10-px");

            const i2 = document.createElement("i");
            i2.classList.add("bi", "bi-eye");
            i2.style.marginRight = "5px";

            const span2 = document.createElement("span");
            span2.setAttribute("data-id", "openOnlineLbl");

            a2.appendChild(i2);
            a2.appendChild(span2);
            buttonsDiv.appendChild(a2);
        }

        bottomDiv.appendChild(buttonsDiv);
        container.appendChild(bottomDiv);

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

        const institutionDiv = document.createElement("div");
        institutionDiv.classList.add("height-100-pct", "row-flex", "justify-center", "margin-0-10-px");

        const img = document.createElement("img");
        img.setAttribute("data-id", x.institution_id);
        img.classList.add("small-logo");

        institutionDiv.appendChild(img);
        institution.appendChild(institutionDiv);
        tr.appendChild(institution);

        // Nombre de la carrera o curso
        const name = document.createElement("td");
        const span = document.createElement("span");
        span.textContent = x.title;
        span.classList.add("pure-black-text", "bold-text");
        name.appendChild(span);
        tr.appendChild(name);

        // Acciones
        const actions = document.createElement("td");
        const buttonsDiv = document.createElement("div");

        if (x.study_plan && x.certificate) {
            buttonsDiv.classList.add("row-flex", "justify-center");
        }

        if (x.study_plan) {
            const a1 = document.createElement("a");
            a1.href = x.study_plan;
            a1.classList.add("plain-link", "soft-black-link", "margin-10-px");

            const i1 = document.createElement("i");
            i1.classList.add("bi", "bi-mortarboard", "mid-font-size");
            a1.appendChild(i1);

            buttonsDiv.appendChild(a1);
        }

        if (x.certificate) {
            const a2 = document.createElement("a");
            a2.href = x.certificate;
            a2.classList.add("plain-link", "soft-black-link", "margin-10-px");

            const i2 = document.createElement("i");
            i2.classList.add("bi", "bi-award", "mid-font-size");
            a2.appendChild(i2);

            buttonsDiv.appendChild(a2);
        }

        actions.appendChild(buttonsDiv);

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

    document.getElementById("messageTxt").value = "";
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