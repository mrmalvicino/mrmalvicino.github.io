document.addEventListener("DOMContentLoaded",
    function()
    {
        var languageRads = document.getElementsByName("languageRad");
        var sourceCodeBtns = document.getElementsByName('sourceCodeBtn');
        var downloadBinaryBtns = document.getElementsByName('downloadBinaryBtn');
        var openOnlineBtns = document.getElementsByName('openOnlineBtn');

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

        function translateDownloadBinaryBtns(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Download";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Descargar";
            }

            for (var i = 0; i < downloadBinaryBtns.length; i++)
            {
                downloadBinaryBtns[i].textContent = text;
            }
        }

        function translateOpenOnlineBtns(selectedLanguage)
        {
            var text = "";

            if (selectedLanguage == "english")
            {
                text = "Open Online";
            }
            else if (selectedLanguage == "spanish")
            {
                text = "Abrir en línea";
            }

            for (var i = 0; i < openOnlineBtns.length; i++)
            {
                openOnlineBtns[i].textContent = text;
            }
        }

        function translate()
        {
            var selectedLanguage = getSelectedLanguage();
            translateSourceCodeBtns(selectedLanguage);
            translateDownloadBinaryBtns(selectedLanguage);
            translateOpenOnlineBtns(selectedLanguage);
        }

        translate();

        for (var i = 0; i < languageRads.length; i++)
        {
            languageRads[i].addEventListener("change", translate);
        }
    }
);