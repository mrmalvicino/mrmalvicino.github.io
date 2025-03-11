document.addEventListener(
    "DOMContentLoaded",
    function () {
        setLangAuto();

        if (!redirecting) {
            fetchJsonFiles();
        }
    }
);

function fetchJsonFiles() {
    const lang = getLang();
    const skillsDataPath = `data/skills-${lang}.json`;
    const studiesDataPath = `data/studies-${lang}.json`;
    const projectsDataPath = `data/projects-${lang}.json`;
    const jobsDataPath = `data/jobs-${lang}.json`;
    const imagesDataPath = `data/images-${lang}.json`;
    const labelsDataPath = `data/labels-${lang}.json`;

    Promise.all([
        fetch(skillsDataPath).then(response => response.json()),
        fetch(studiesDataPath).then(response => response.json()),
        fetch(projectsDataPath).then(response => response.json()),
        fetch(jobsDataPath).then(response => response.json()),
        fetch(imagesDataPath).then(response => response.json()),
        fetch(labelsDataPath).then(response => response.json())
    ])
        .then(
            (
                [
                    skillsData,
                    studiesData,
                    projectsData,
                    jobsData,
                    imagesData,
                    labelsData
                ]
            ) => {
                renderCvStacks(skillsData.stacks);
                renderCvStudies(studiesData.studies);
                renderCvProjects(projectsData.projects.filter(x => x.shown_in_cv));
                renderCvJobs(jobsData.jobs);
                bindCommonImages(imagesData.common_images);
                bindUniqueLabels(labelsData.cv_page_labels);
                bindCommonLabels(labelsData.common_labels);
            }
        )
        .catch(error => console.error(`Error al cargar los archivos JSON:`, error));
}