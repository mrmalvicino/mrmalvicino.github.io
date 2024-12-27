document.addEventListener("DOMContentLoaded",
    function()
    {
        var languageRads = document.getElementsByName("languageRad");

        /* .NET */

        var meeniErpTxt = document.getElementById("meeniErpTxt");
        var ecommerceNetTxt = document.getElementById("ecommerceNetTxt");

        /* Python */

        var dspPackageTxt = document.getElementById("dspPackageTxt");
        var stusCalculatorTxt = document.getElementById("stusCalculatorTxt");
        var ancResearchPlanTxt = document.getElementById("ancResearchPlanTxt");

        /* Java */

        var bancarTxt = document.getElementById("bancarTxt");

        /* C++ */

        var dugunAutoClickerTxt = document.getElementById("dugunAutoClickerTxt");
        var binaryCalculatorTxt = document.getElementById("binaryCalculatorTxt");
        var balumaErpTxt = document.getElementById("balumaErpTxt");
        var irwinsRevengeTxt = document.getElementById("irwinsRevengeTxt");
        var arduinoTxt = document.getElementById("arduinoTxt");

        /* HTML */

        var mokaLandingTxt = document.getElementById("mokaLandingTxt");
        var portfolioTxt = document.getElementById("portfolioTxt");

        /* Notes */

        var dspNotesTxt = document.getElementById("dspNotesTxt");
        var acousticsNotesTxt = document.getElementById("acousticsNotesTxt");
        var electronicsNotesTxt = document.getElementById("electronicsNotesTxt");
        var mathNotesTxt = document.getElementById("mathNotesTxt");
        var physicsBookTxt = document.getElementById("physicsBookTxt");
        var physicsGuideTxt = document.getElementById("physicsGuideTxt");
        var physicsExercisesTxt = document.getElementById("physicsExercisesTxt");
        var physicsNotesTxt = document.getElementById("physicsNotesTxt");

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

        /* .NET */

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

        /* Python */

        function translateDspPackageTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Provides a set of tools for digital signal processing. Designed to facilitate the generation, manipulation, and visualization of signals, as well as the application of filters.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Proporciona un conjunto de herramientas para el procesamiento digital de señales. Diseñado para facilitar la generación, manipulación y visualización de señales, así como la aplicación de filtros.";
            }

            dspPackageTxt.textContent = text;
        }

        function translateStusCalculatorTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Graphic calculator that aproximates periodic functions by calculating it's orthogonal projection over a trigonometric polynomials vector space.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Calculadora gráfica que aproxima funciones periódicas calculando su proyección ortogonal sobre un espacio vectorial de polinomios trigonométricos.";
            }

            stusCalculatorTxt.textContent = text;
        }

        function translateAncResearchPlanTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Research plan that involves a subjective evaluation of active noise cancellation in headphones. Statistical analysis was performed using SciPy module and the generation of dummy data through a custom algorithm.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Plan de investigación que implica una evaluación subjetiva de la cancelación activa de ruido en auriculares. Análisis estadístico hecho mediante el módulo SciPy y la generación de datos ficticios mediante un algoritmo propio.";
            }

            ancResearchPlanTxt.textContent = text;
        }

        /* Java */

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

        /* C++ */

        function translateDugunAutoClickerTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Mouse automation macro software that enables users to createate squencies of mouse actions with each action customizable position, duration and mouse click.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Software de macro automatización del mouse que permite a los usuarios crear secuencias de acciones del mouse con posición, duración y clic del mouse personalizables para cada acción.";
            }

            dugunAutoClickerTxt.textContent = text;
        }

        function translateBinaryCalculatorTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Script that converts numbers between different numeral bases using pointers and dynamic memory allocation to manage the conversion process.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Script que convierte números entre diferentes bases numéricas utilizando punteros y asignación de memoria dinámica para gestionar el proceso de conversión.";
            }

            binaryCalculatorTxt.textContent = text;
        }

        function translateBalumaErpTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Demonstration of enterprice resource planning software with modules to register sales, manage inventory stock, schedule purchases from suppliers, and keep the accounting.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Demostración de software de planificación de recursos empresariales con módulos para registrar ventas, administrar stock de inventario, programar compras a proveedores y llevar la contabilidad.";
            }

            balumaErpTxt.textContent = text;
        }

        function translateIrwinsRevengeTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Two player dice game with terminal interface. Players compete in two phases: collecting statuettes in the Expedition Phase and forming dice combinations in the Final Phase. The player with the best use of their collected statuettes wins.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Juego de dados para dos jugadores con interfaz de terminal. Los jugadores compiten en dos fases: recolectando estatuillas en la fase de expedición y formando combinaciones de dados en la fase final. El jugador que mejor utilice las estatuillas recolectadas gana.";
            }

            irwinsRevengeTxt.textContent = text;
        }

        function translateArduinoTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Arduino project that implements LED light effects controlled by a button panel using an Arduino. Matrices and vectors are used to manage dynamic lighting patterns, allowing users to activate different effects.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Proyecto Arduino que implementa efectos de luz LED controlados por una botonera mediante un Arduino. Se utilizan matrices y vectores para gestionar patrones de iluminación dinámicos, permitiendo a los usuarios activar diferentes efectos.";
            }

            arduinoTxt.textContent = text;
        }

        /* HTML */

        function translateMokaLandingTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Landing page created with HTML, CSS and JavaScript for a business specialized in the sale of baskets, bags, placemats and rugs. A custom domain was linked with the respective DNS settings.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Landing page creada con HTML, CSS y JavaScript para un negocio especializado en la venta de cestas, bolsos, manteles individuales y alfombras. Se vinculó un dominio personalizado con la configuración de DNS correspondiente.";
            }

            mokaLandingTxt.textContent = text;
        }

        function translatePortfolioTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Responsive website to showcase projects and achievements, built with HTML, CSS, and JavaScript. Features include a dynamic portfolio section, interactive elements, and deployment via GitHub Pages.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Sitio web responsivo para mostrar proyectos y logros, creado con HTML, CSS y JavaScript. Las características incluyen una sección de portafolio dinámica, elementos interactivos y fue implementado con GitHub Pages.";
            }

            portfolioTxt.textContent = text;
        }

        /* Notes */

        function translateDspNotesTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Digital signal processing notes for sound engineering. A Yaml script was implemented with GitHub Actions to run LuaLaTex or pdfLaTex and compile a PDF that is automatically uploaded as a Release.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Apuntes de procesamiento digital de señales para ingeniería de sonido. Se implementó un script Yaml con GitHub Actions para correr LuaLaTex o pdfLaTex y compilar un PDF que se sube automáticamente como Release.";
            }

            dspNotesTxt.textContent = text;
        }

        function translateAcousticsNotesTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Acoustics notes for sound engineering. A Yaml script was implemented with GitHub Actions to run LuaLaTex or pdfLaTex and compile a PDF that is automatically uploaded as a Release.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Apuntes de acústica para ingeniería de sonido. Se implementó un script Yaml con GitHub Actions para correr LuaLaTex o pdfLaTex y compilar un PDF que se sube automáticamente como Release.";
            }

            acousticsNotesTxt.textContent = text;
        }

        function translateElectronicsNotesTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Electronics notes for sound engineering. A Yaml script was implemented with GitHub Actions to run LuaLaTex or pdfLaTex and compile a PDF that is automatically uploaded as a Release.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Apuntes de electrónica para ingeniería de sonido. Se implementó un script Yaml con GitHub Actions para correr LuaLaTex o pdfLaTex y compilar un PDF que se sube automáticamente como Release.";
            }

            electronicsNotesTxt.textContent = text;
        }

        function translateMathNotesTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Math notes for sound engineering. A Yaml script was implemented with GitHub Actions to run LuaLaTex or pdfLaTex and compile a PDF that is automatically uploaded as a Release.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Apuntes de matemática para ingeniería de sonido. Se implementó un script Yaml con GitHub Actions para correr LuaLaTex o pdfLaTex y compilar un PDF que se sube automáticamente como Release.";
            }

            mathNotesTxt.textContent = text;
        }

        function translatePhysicsBookTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Mechanical physics book for sound engineering. A Yaml script was implemented with GitHub Actions to run LuaLaTex or pdfLaTex and compile a PDF that is automatically uploaded as a Release.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Libro de física mecánica para ingeniería de sonido. Se implementó un script Yaml con GitHub Actions para correr LuaLaTex o pdfLaTex y compilar un PDF que se sube automáticamente como Release.";
            }

            physicsBookTxt.textContent = text;
        }

        function translatePhysicsGuideTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Exercise guide for the subject Physics 1 of Sound Engineering at Untref. A Yaml script was implemented with GitHub Actions to run LuaLaTex or pdfLaTex and compile a PDF that is automatically uploaded as a Release.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Guía de ejercicios para la asignatura Física 1 de Ingeniería de Sonido en la Untref. Se implementó un script Yaml con GitHub Actions para correr LuaLaTex o pdfLaTex y compilar un PDF que se sube automáticamente como Release.";
            }

            physicsGuideTxt.textContent = text;
        }

        function translatePhysicsExercisesTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Solved exercises of the subject Physics 1 of Sound Engineering at Untref.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Ejercicios resueltos de la asignatura Física 1 de Ingeniería de Sonido en la Untref.";
            }

            physicsExercisesTxt.textContent = text;
        }

        function translatePhysicsNotesTxt(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Notes of the subject Physics 2 of Sound Engineering at Untref.";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Apuntes de la asignatura Física 2 de Ingeniería del Sonido en la Untref.";
            }

            physicsNotesTxt.textContent = text;
        }

        function translate()
        {
            var selectedLanguage = getSelectedLanguage();

            /* .NET */

            translateMeeniErpTxt(selectedLanguage);
            translateEcommerceNetTxt(selectedLanguage);

            /* Python */

            translateDspPackageTxt(selectedLanguage);
            translateStusCalculatorTxt(selectedLanguage);
            translateAncResearchPlanTxt(selectedLanguage);

            /* Java */

            translateBancarTxt(selectedLanguage);

            /* C++ */

            translateDugunAutoClickerTxt(selectedLanguage);
            translateBinaryCalculatorTxt(selectedLanguage);
            translateBalumaErpTxt(selectedLanguage);
            translateIrwinsRevengeTxt(selectedLanguage);
            translateArduinoTxt(selectedLanguage);

            /* HTML */

            translateMokaLandingTxt(selectedLanguage);
            translatePortfolioTxt(selectedLanguage);

            /* Notes */

            translateDspNotesTxt(selectedLanguage);
            translateAcousticsNotesTxt(selectedLanguage);
            translateElectronicsNotesTxt(selectedLanguage);
            translateMathNotesTxt(selectedLanguage);
            translatePhysicsBookTxt(selectedLanguage);
            translatePhysicsGuideTxt(selectedLanguage);
            translatePhysicsExercisesTxt(selectedLanguage);
            translatePhysicsNotesTxt(selectedLanguage);
        }

        translate();

        for (var i = 0; i < languageRads.length; i++)
        {
            languageRads[i].addEventListener("change", translate);
        }
    }
);