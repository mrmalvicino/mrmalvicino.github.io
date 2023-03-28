async function gen_pdf_1() {
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
}

async function gen_pdf_2() {
    var download = document.getElementById("body");
    var doc = new jsPDF('p', 'pt', 'a4');

    await html2canvas(download, {
        //allowTaint: true,
        useCORS: true,
        width: 1050
    }).then((canvas) => {
        doc.addImage(canvas.toDataURL("image/png"), 'PNG', 0, 0, 1050, 1485);
    })

    doc.save("cv-malvicino.pdf");
}