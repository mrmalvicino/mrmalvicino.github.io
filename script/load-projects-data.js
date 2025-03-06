document.addEventListener(
    "DOMContentLoaded",
    function () {
        fetchProjectsData();
        fetchFooter();
        keepQueryParameters();
    }
);

function fetchProjectsData() {
    const lang = getLang();
    const projectsDataUrl = `data/projects-${lang}.json`;
    const commonDataUrl = `data/common-${lang}.json`;

    Promise.all([
        fetch(projectsDataUrl).then(response => response.json()),
        fetch(commonDataUrl).then(response => response.json())
    ])
        .then(([projectsData, commonData]) => {
            renderProjectsData(projectsData);
            renderCommonData(commonData);
        })
        .catch(error => console.error(`Error al cargar los archivos JSON:`, error));
}

function renderProjectsData(projectsData) {
    renderProjects(projectsData);
    bindUniqueImages(projectsData);
    bindUniqueLabels(projectsData);
}

function renderCommonData(commonData) {
    bindCommonImages(commonData);
    bindCommonLabels(commonData);
}

function renderProjects(projectsData) {
    const projects = document.getElementById("projectsDiv");
    projects.innerHTML = "";

    projectsData.projects.forEach(x => {
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