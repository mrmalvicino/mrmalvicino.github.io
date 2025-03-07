document.addEventListener(
    "DOMContentLoaded",
    function () {
        fetchJsonFiles();
        insertFooter();
        keepQueryParameters();
        defineMenuClosers();
    }
);

function fetchJsonFiles() {
    const lang = getLang();
    const menuDataPath = `data/menu-${lang}.json`;
    const skillsDataPath = `data/skills-${lang}.json`;
    const projectsDataPath = `data/projects-${lang}.json`;
    const studiesDataPath = `data/studies-${lang}.json`;
    const imagesDataPath = `data/images-${lang}.json`;
    const labelsDataPath = `data/labels-${lang}.json`;
    const textboxesDataPath = `data/textboxes-${lang}.json`;
    const buttonsDataPath = `data/buttons-${lang}.json`;

    Promise.all([
        fetch(menuDataPath).then(response => response.json()),
        fetch(skillsDataPath).then(response => response.json()),
        fetch(projectsDataPath).then(response => response.json()),
        fetch(studiesDataPath).then(response => response.json()),
        fetch(imagesDataPath).then(response => response.json()),
        fetch(labelsDataPath).then(response => response.json()),
        fetch(textboxesDataPath).then(response => response.json()),
        fetch(buttonsDataPath).then(response => response.json())
    ])
        .then(
            (
                [
                    menuData,
                    skillsData,
                    projectsData,
                    studiesData,
                    imagesData,
                    labelsData,
                    textboxesData,
                    buttonsData
                ]
            ) => {
                renderMenu(menuData.menu_items);
                renderBanner(skillsData.banner_items);
                renderStacks(skillsData.stacks);
                renderProjects(projectsData.projects.filter(x => x.shown_in_portfolio));
                renderStudies(studiesData.studies);
                bindCommonImages(imagesData.common_images);
                bindCommonImages(imagesData.technologies_images);
                bindCommonImages(imagesData.institutions_images);
                bindCommonImages(imagesData.projects_images);
                bindUniqueLabels(labelsData.index_page_labels);
                bindCommonLabels(labelsData.common_labels);
                bindTextboxes(textboxesData.index_page_textboxes);
                bindButtons(buttonsData.index_page_buttons);
            }
        )
        .catch(error => console.error(`Error al cargar los archivos JSON:`, error));
}