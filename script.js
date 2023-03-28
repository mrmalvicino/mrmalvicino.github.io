document.addEventListener("DOMContentLoaded", () => {
    // Listens to the button
    const $button = document.querySelector("#cv-button")
    $button.addEventListener("click", () => {
        const $capture = document.body;
        html2pdf()
            set({
                margin: 1,
                filename: 'cv-malvicino.pdf',
                image: {type: 'jpeg', quality: 0.98},
                html2canvas: {scale: 3, letterRendering: true},
                jsPDF: {unit: "in", format: "a4", orientation: 'portrait'}
            })
            .from($capture)
            .save()
            .catch(err => console.log(err))
            .finally()
            .then(() => {console.log("Guardado exitosamente.")})
    });
});