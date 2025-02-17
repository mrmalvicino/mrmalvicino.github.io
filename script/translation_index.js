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

        /* Skills */

        var skillsTxt = document.getElementById("skillsTxt");

        /* Projects */

        var projectsTxt = document.getElementById("projectsTxt");
        var allProjectsBtn = document.getElementById("allProjectsBtn");
        var meeniErpTxt = document.getElementById("meeniErpTxt");
        var ecommerceNetTxt = document.getElementById("ecommerceNetTxt");
        var bancarTxt = document.getElementById("bancarTxt");

        /* Education */

        var educationTxt = document.getElementById("educationTxt");
        var soundEngineeringTxt = document.getElementById("soundEngineeringTxt");
        var tupTxt = document.getElementById("tupTxt");
        var portugueseTxt = document.getElementById("portugueseTxt");

        /* Contact */

        var contactTxt = document.getElementById("contactTxt");
        var nameTxt = document.getElementById("name");
        var phoneTxt = document.getElementById("phone");
        var messageTxt = document.getElementById("message");
        var nameLbl = document.getElementById("nameLbl");
        var phoneLbl = document.getElementById("phoneLbl");
        var messageLbl = document.getElementById("messageLbl");
        var submitBtn = document.getElementById("submitBtn");

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
                text = "JR .NET Developer";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Desarrollador .NET JR";
            }

            degreesTxt.textContent = text;
        }

        function translatePresentationTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Hi! I am Max, and I am passionate about acoustics and programming. Throughout my career, I have been working on projects that combine these fields and converge in signals processing. Until now, my work experience has been mostly focused on teaching. Motivated by the new challenges that the growth of the technology industry implies, I am currently looking for my first permanent employment in the IT field as a software developer.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "¡Hola! Soy Maxi, y me apasiona la acústica y la programación. A lo largo de mi carrera trabajé en proyectos que combinan estos campos y convergen en el procesamiento de señales. Hasta ahora mi experiencia laboral se centró mayoritariamente en la docencia. Motivado por los nuevos desafíos que implica el crecimiento de la industria tecnológica, actualmente estoy buscando mi primera experiencia en el campo de las TI como desarrollador de software en relación de dependencia.";
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

        /* Skills */

        function translateSkillsTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "SKILLS";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "HABILIDADES";
            }

            skillsTxt.textContent = text;
        }

        /* Projects */

        function translateProjectsTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "PROJECTS";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "PROYECTOS";
            }

            projectsTxt.textContent = text;
        }

        function translateAllProjectsBtn(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "All Projects";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Más proyectos";
            }

            allProjectsBtn.textContent = text;
        }

        function translateMeeniErpTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Simple enterprise resource planning software. Performs quotations, registers sales, manages stock, schedules purchases, and keeps the accounting.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Software de planificación de recursos empresariales sencillo. Realiza cotizaciones, registra ventas, gestiona stock, programa compras y lleva la contabilidad.";
            }

            meeniErpTxt.textContent = text;
        }

        function translateEcommerceNetTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Ecommerce developed with ASP.NET and C# that includes product management, shopping cart, user accounts, and order management.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Comercio electrónico desarrollado con ASP.NET y C# que incluye gestión de productos, carrito de compra, cuentas de usuario y gestión de pedidos.";
            }

            ecommerceNetTxt.textContent = text;
        }

        function translateBancarTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "BancAr is a banking management system designed to manage the operations of a banking entity, allowing the management of clients, accounts, loans and transfers.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "BancAr es un sistema de gestión bancaria diseñado para administrar las operaciones de una entidad bancaria, permitiendo la gestión de clientes, cuentas, préstamos y transferencias.";
            }

            bancarTxt.textContent = text;
        }

        /* Education */

        function translateEducationTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "EDUCATION";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "ESTUDIOS";
            }

            educationTxt.textContent = text;
        }

        function translateSoundEngineeringTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Sound Engineering (60%)";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Ingeniería de Sonido (60%)";
            }

            soundEngineeringTxt.textContent = text;
        }

        function translateTupTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Technical Degree in Programming";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Tecnicatura Universitaria en Programación";
            }

            tupTxt.textContent = text;
        }

        function translatePortugueseTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Portuguese Course (UTN level 3)";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Curso de Portugués (Nivel 3 UTN)";
            }

            portugueseTxt.textContent = text;
        }

        /* Contact */

        function translateContactTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "CONTACT";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "CONTACTO";
            }

            contactTxt.textContent = text;
        }

        function translateNameTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Name";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Nombre";
            }

            nameTxt.placeholder = text;
        }

        function translatePhoneTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Phone";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Teléfono";
            }

            phoneTxt.placeholder = text;
        }

        function translateMessageTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Message";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Mensaje";
            }

            messageTxt.placeholder = text;
        }

        function translateNameLbl(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Name:";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Nombre:";
            }

            nameLbl.textContent = text;
        }

        function translatePhoneLbl(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Phone:";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Teléfono:";
            }

            phoneLbl.textContent = text;
        }

        function translateMessageLbl(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Message:";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Mensaje:";
            }

            messageLbl.textContent = text;
        }

        function translateSubmitBtn(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Submit";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Enviar";
            }

            submitBtn.textContent = text;
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

            /* Skills */

            translateSkillsTxt(selectedLanguage);

            /* Projects */

            translateProjectsTxt(selectedLanguage);
            translateAllProjectsBtn(selectedLanguage);
            translateMeeniErpTxt(selectedLanguage);
            translateEcommerceNetTxt(selectedLanguage);
            translateBancarTxt(selectedLanguage);

            /* Education */

            translateEducationTxt(selectedLanguage);
            translateSoundEngineeringTxt(selectedLanguage);
            translateTupTxt(selectedLanguage);
            translatePortugueseTxt(selectedLanguage);

            /* Contact */

            translateContactTxt(selectedLanguage);
            translateNameTxt(selectedLanguage);
            translatePhoneTxt(selectedLanguage);
            translateMessageTxt(selectedLanguage);
            translateNameLbl(selectedLanguage);
            translatePhoneLbl(selectedLanguage);
            translateMessageLbl(selectedLanguage);
            translateSubmitBtn(selectedLanguage);
        }

        translate();

        for (var i = 0; i < languageRads.length; i++)
        {
            languageRads[i].addEventListener("change", translate);
        }
    }
);