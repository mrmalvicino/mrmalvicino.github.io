document.addEventListener("DOMContentLoaded",
    function()
    {
        var languageRads = document.getElementsByName("languageRad");
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
            translateSourceCodeBtns(selectedLanguage);
        }

        translate();

        for (var i = 0; i < languageRads.length; i++)
        {
            languageRads[i].addEventListener("change", translate);
        }
    }
);