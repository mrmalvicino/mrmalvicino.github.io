document.addEventListener(
    "DOMContentLoaded",
    function () {
        fetchJsonFiles();
        setLangAuto();
    }
);

function fetchJsonFiles() {
    const lang = getLang();
    const skillsDataPath = `data/skills-${lang}.json`;
    const projectsDataPath = `data/projects-${lang}.json`;
    const studiesDataPath = `data/studies-${lang}.json`;
    const imagesDataPath = `data/images-${lang}.json`;
    const labelsDataPath = `data/labels-${lang}.json`;

    Promise.all([
        fetch(skillsDataPath).then(response => response.json()),
        fetch(projectsDataPath).then(response => response.json()),
        fetch(studiesDataPath).then(response => response.json()),
        fetch(imagesDataPath).then(response => response.json()),
        fetch(labelsDataPath).then(response => response.json())
    ])
        .then(
            (
                [
                    skillsData,
                    projectsData,
                    studiesData,
                    imagesData,
                    labelsData
                ]
            ) => {
                renderCvStacks(skillsData.stacks);
                renderCvProjects(projectsData.projects.filter(x => x.shown_in_cv));
                renderCvStudies(studiesData.studies);
                bindCommonImages(imagesData.common_images);
                bindCommonLabels(labelsData.common_labels);
            }
        )
        .catch(error => console.error(`Error al cargar los archivos JSON:`, error));
}