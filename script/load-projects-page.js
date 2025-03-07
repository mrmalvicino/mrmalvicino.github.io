document.addEventListener(
    "DOMContentLoaded",
    function () {
        fetchJsonFiles();
        insertFooter();
        keepQueryParameters();
    }
);

function fetchJsonFiles() {
    const lang = getLang();
    const projectsDataPath = `data/projects-${lang}.json`;
    const imagesDataPath = `data/images-${lang}.json`;
    const labelsDataPath = `data/labels-${lang}.json`;

    Promise.all([
        fetch(projectsDataPath).then(response => response.json()),
        fetch(imagesDataPath).then(response => response.json()),
        fetch(labelsDataPath).then(response => response.json()),
    ])
        .then(
            (
                [
                    projectsData,
                    imagesData,
                    labelsData,
                ]
            ) => {
                renderProjects(projectsData.projects);
                bindCommonImages(imagesData.common_images);
                bindCommonImages(imagesData.projects_images);
                bindCommonImages(imagesData.technologies_images);
                bindUniqueLabels(labelsData.projects_page_labels);
                bindCommonLabels(labelsData.common_labels);
            }
        )
        .catch(error => console.error(`Error al cargar los archivos JSON:`, error));
}