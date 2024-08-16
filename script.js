document.addEventListener("DOMContentLoaded", function()
{
    /* Menú */

    const toggleButton = document.querySelector('.toggle-button');
    const menuList = document.querySelector('.header-menu ul');
    const menuItems = document.querySelectorAll('.header-menu li a');
    
    toggleButton.addEventListener('click', () =>
        {
            menuList.classList.toggle('show');
        }
    );
    
    menuItems.forEach(function(item)
        {
            item.addEventListener('click', function()
            {
                menuList.classList.remove('show');
            });
        }
    );

    /* Traducciones */

    var languageRads = document.getElementsByName("languageRad");
    var presentationTxt = document.getElementById("presentationTxt");
    var resumeBtn = document.getElementById("resumeBtn");
    var sourceCodeBtns = document.getElementsByName('sourceCodeBtn');

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

    function translateSourceCodeBtns(selectedLanguage)
    {
        var text = "";

        if (selectedLanguage == "english")
        {
            text = "Source Code";
        }
        else if (selectedLanguage == "spanish")
        {
            text = "Código fuente";
        }

        for (var i = 0; i < sourceCodeBtns.length; i++)
        {
            sourceCodeBtns[i].textContent = text;
        }
    }

    function translate()
    {
        var selectedLanguage = getSelectedLanguage();
        translatePresentationTxt(selectedLanguage);
        translateResumeBtn(selectedLanguage);
        translateSourceCodeBtns(selectedLanguage);
    }

    translate();

    for (var i = 0; i < languageRads.length; i++)
    {
        languageRads[i].addEventListener("change", translate);
    }
}
);