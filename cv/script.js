async function download_pdf() {
    const $capture = document.body;
    html2pdf()
        .set({
            filename: 'cv-malvicino.pdf',
            image: {type: 'jpeg', quality: 0.99},
            html2canvas: {scale: 3, letterRendering: true},
            jsPDF: {unit: "in", format: "a3", orientation: 'portrait'}
        })
        .from($capture)
        .save()
        .catch(err => console.log(err))
        .finally()
        .then(() => {console.log("Fin de la ejecución.")})
}