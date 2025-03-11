function renderCvStacks(stacksData) {
    const skillsUl = document.getElementById("skillsLst");
    skillsUl.innerHTML = "";

    stacksData.forEach(x => {
        const stackLi = document.createElement("li");

        const h3 = document.createElement("h3");
        h3.textContent = x.title;
        stackLi.appendChild(h3);

        const ul = document.createElement("ul");

        x.items.forEach(y => {
            const li = document.createElement("li");
            li.textContent = y;
            ul.appendChild(li);
        });

        stackLi.appendChild(ul);
        skillsUl.appendChild(stackLi);
    });
}

function renderCvStudies(studiesData) {
    const careersUl = document.getElementById("careersLst");
    careersUl.innerHTML = "";

    const careers = studiesData.filter(x => x.type === "career");

    careers.forEach(x => {
        const careerLi = document.createElement("li");
        careerLi.classList.add("margin-vertical-10-px");

        const h4 = document.createElement("h4");
        h4.textContent = x.title;
        careerLi.appendChild(h4);

        const p = document.createElement("p");
        p.textContent = x.institution_name;
        careerLi.appendChild(p);

        careersUl.appendChild(careerLi);
    });

    const coursesUl = document.getElementById("coursesLst");
    coursesUl.innerHTML = "";

    const courses = studiesData.filter(x => x.type === "course");

    courses.forEach(x => {
        const courseLi = document.createElement("li");
        courseLi.classList.add("margin-vertical-10-px");

        const h4 = document.createElement("h4");
        h4.textContent = x.title;
        courseLi.appendChild(h4);

        const p = document.createElement("p");
        p.textContent = x.institution_name;
        courseLi.appendChild(p);

        coursesUl.appendChild(courseLi);
    });

    const languagesUl = document.getElementById("languagesLst");
    languagesUl.innerHTML = "";

    const languages = studiesData.filter(x => x.type === "language");

    languages.forEach(x => {
        const languageLi = document.createElement("li");
        languageLi.classList.add("margin-vertical-10-px");

        const h4 = document.createElement("h4");
        h4.textContent = x.title;
        languageLi.appendChild(h4);

        const p = document.createElement("p");
        p.textContent = x.institution_name;
        languageLi.appendChild(p);

        languagesUl.appendChild(languageLi);
    });
}

function renderCvProjects(projectsData) {
    const projectsUl = document.getElementById("projectsLst");
    projectsUl.innerHTML = "";

    projectsData.forEach(x => {
        const projectLi = document.createElement("li");
        projectLi.classList.add("margin-vertical-20-px");

        const h4 = document.createElement("h4");
        h4.textContent = x.title;
        projectLi.appendChild(h4);

        const descriptionP = document.createElement("p");
        descriptionP.classList.add("dark-gray-text");
        descriptionP.textContent = x.description;
        projectLi.appendChild(descriptionP);

        if (x.video_url) {
            const videoA = document.createElement("a");
            videoA.classList.add("plain-link", "soft-black-text");
            videoA.href = x.video_url;
            videoA.textContent = x.video_url;
            projectLi.appendChild(videoA);
        }

        if (x.source_code) {
            const codeA = document.createElement("a");
            codeA.classList.add("plain-link", "soft-black-text");
            codeA.href = x.source_code;
            codeA.textContent = x.source_code;
            projectLi.appendChild(codeA);
        }

        projectsUl.appendChild(projectLi);
    });
}

function renderCvJobs(jobsData) {
    const jobsUl = document.getElementById("jobsLst");
    jobsUl.innerHTML = "";

    jobsData.forEach(x => {
        const jobLi = document.createElement("li");
        jobLi.classList.add("margin-vertical-20-px");

        const h4 = document.createElement("h4");
        h4.textContent = x.position;
        jobLi.appendChild(h4);

        const organizationP = document.createElement("p");
        organizationP.textContent = x.organization;
        jobLi.appendChild(organizationP);

        const timeP = document.createElement("p");
        timeP.textContent = x.time;
        jobLi.appendChild(timeP);

        const descriptionP = document.createElement("p");
        descriptionP.classList.add("dark-gray-text");
        descriptionP.textContent = x.description;
        jobLi.appendChild(descriptionP);

        jobsUl.appendChild(jobLi);
    });
}

// Available in other JS files globally

window.renderCvStacks = renderCvStacks;
window.renderCvStudies = renderCvStudies;
window.renderCvProjects = renderCvProjects;
window.renderCvJobs = renderCvJobs;