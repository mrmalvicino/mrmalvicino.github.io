document.addEventListener("DOMContentLoaded",
    function()
    {
        var languageRads = document.getElementsByName("languageRad");

        /* .NET */

        var meeniErpTxt = document.getElementById("meeniErpTxt");
        var ecommerceNetTxt = document.getElementById("ecommerceNetTxt");

        /* Python */

        var dspPackageTxt = document.getElementById("dspPackageTxt");

        /* C++ */

        /* HTML */

        /* Notes */

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

        /* C++ */

        /* HTML */

        /* Notes */

        function translate()
        {
            var selectedLanguage = getSelectedLanguage();

            /* .NET */

            translateMeeniErpTxt(selectedLanguage);
            translateEcommerceNetTxt(selectedLanguage);

            /* Python */

            translateDspPackageTxt(selectedLanguage);

            /* C++ */

            /* HTML */

            /* Notes */
        }

        translate();

        for (var i = 0; i < languageRads.length; i++)
        {
            languageRads[i].addEventListener("change", translate);
        }
    }
);