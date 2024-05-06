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

    var languageRadiobuttons = document.getElementsByName("language");
    var presentationParagraph = document.getElementById("presentation-paragraph");
    var cvButton = document.getElementById("cv-button");

    function getSelectedLanguage()
    {
        for (var i = 0; i < languageRadiobuttons.length; i++) {
            if (languageRadiobuttons[i].checked) {
                return languageRadiobuttons[i].value;
            }
        }

        return null;
    }

    function translatePresentation(selectedLanguage)
    {
        var text = "";

        if (selectedLanguage == "english")
        {
            text = "Hello! My name is Maximiliano Raúl Malvicino. I am passionate about acoustics and programming. Throughout my career, I have been working on projects that combine these fields and converge in signals processing. Until now, my work experience has been mostly focused on teaching. Motivated by the new challenges that the growth of the technology industry implies, I am currently looking for my first experience in the IT field as a software developer.";
        }
        else if (selectedLanguage == "spanish")
        {
            text = "¡Hola! Mi nombre es Maximiliano Raúl Malvicino. Me apasiona la acústica y la programación. A lo largo de mi carrera trabajé en proyectos que combinan estos campos y convergen en el procesamiento de señales. Hasta ahora mi experiencia laboral se centró mayoritariamente en la docencia. Motivado por los nuevos desafíos que implica el crecimiento de la industria tecnológica, actualmente estoy buscando mi primera experiencia en el campo de las TI como desarrollador de software.";
        }

        presentationParagraph.textContent = text;
    }

    function translateCVButton(selectedLanguage)
    {
        var text = "";
        var href = "";
        var download = "";

        if (selectedLanguage == "english")
            {
                text = "Download CV";
                href = "./cv/cv-malvicino-en.pdf";
                download = "cv-malvicino-en";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Descargar CV";
                href = "./cv/cv-malvicino-es.pdf";
                download = "cv-malvicino-es";
            }

            cvButton.textContent = text;
            cvButton.setAttribute("href", href);
            cvButton.setAttribute("download", download);
    }

    function translate()
    {
        var selectedLanguage = getSelectedLanguage();
        translatePresentation(selectedLanguage);
        translateCVButton(selectedLanguage);
    }

    translate();

    for (var i = 0; i < languageRadiobuttons.length; i++)
    {
        languageRadiobuttons[i].addEventListener("change", translate);
    }
}
);