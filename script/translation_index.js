document.addEventListener("DOMContentLoaded",
    function()
    {
        var languageRads = document.getElementsByName("languageRad");

        /* Header */

        var aboutBtn = document.getElementById("aboutBtn");
        var skillsBtn = document.getElementById("skillsBtn");
        var projectsBtn = document.getElementById("projectsBtn");
        var educationBtn = document.getElementById("educationBtn");
        var contactBtn = document.getElementById("contactBtn");

        /* About */

        var degreesTxt = document.getElementById("degreesTxt");
        var presentationTxt = document.getElementById("presentationTxt");
        var resumeBtn = document.getElementById("resumeBtn");

        function getSelectedLanguage()
        {
            for (var i = 0; i < languageRads.length; i++)
            {
                if (languageRads[i].checked)
                {
                    return languageRads[i].value;
                }
            }

            return null;
        }

        /* Header */

        function translateAboutBtn(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "About me";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Sobre mi";
            }

            aboutBtn.textContent = text;
        }

        function translateSkillsBtn(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Skills";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Habilidades";
            }

            skillsBtn.textContent = text;
        }

        function translateProjectsBtn(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Projects";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Proyectos";
            }

            projectsBtn.textContent = text;
        }

        function translateEducationBtn(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Education";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Estudios";
            }

            educationBtn.textContent = text;
        }

        function translateContactBtn(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Contact";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Contacto";
            }

            contactBtn.textContent = text;
        }

        /* About */

        function translateDegreesTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Software developer | Sound Engineer";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Programador | Ingeniero de Sonido";
            }

            degreesTxt.textContent = text;
        }

        function translatePresentationTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Hi! I am Max, and I am passionate about acoustics and programming. Throughout my career, I have been working on projects that combine these fields and converge in signals processing. Until now, my work experience has been mostly focused on teaching. Motivated by the new challenges that the growth of the technology industry implies, I am currently looking for my first experience in the IT field as a software developer.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "¡Hola! Soy Maxi, y me apasiona la acústica y la programación. A lo largo de mi carrera trabajé en proyectos que combinan estos campos y convergen en el procesamiento de señales. Hasta ahora mi experiencia laboral se centró mayoritariamente en la docencia. Motivado por los nuevos desafíos que implica el crecimiento de la industria tecnológica, actualmente estoy buscando mi primera experiencia en el campo de las TI como desarrollador de software.";
            }

            presentationTxt.textContent = text;
        }

        function translateResumeBtn(selectedLanguage)
        {
            var text = "";
            var href = "";
            var download = "";

            if (selectedLanguage == "english")
            {
                text = "Download CV";
                href = "./cv/cv-malvicino-en.pdf";
                download = "cv-malvicino-en.pdf";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Descargar CV";
                href = "./cv/cv-malvicino-es.pdf";
                download = "cv-malvicino-es.pdf";
            }

            resumeBtn.textContent = text;
            resumeBtn.setAttribute("href", href);
            resumeBtn.setAttribute("download", download);
        }

        function translate()
        {
            var selectedLanguage = getSelectedLanguage();

            /* Header */

            translateAboutBtn(selectedLanguage);
            translateSkillsBtn(selectedLanguage);
            translateProjectsBtn(selectedLanguage);
            translateEducationBtn(selectedLanguage);
            translateContactBtn(selectedLanguage);

            /* About */

            translateDegreesTxt(selectedLanguage);
            translatePresentationTxt(selectedLanguage);
            translateResumeBtn(selectedLanguage);
        }

        translate();

        for (var i = 0; i < languageRads.length; i++)
        {
            languageRads[i].addEventListener("change", translate);
        }
    }
);