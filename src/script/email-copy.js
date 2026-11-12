document.querySelectorAll("[data-copy-email]").forEach(element => {
	element.addEventListener("click", async event => {
		event.preventDefault();

		try {
			await navigator.clipboard.writeText(element.dataset.copyEmail);
			alert(`${element.dataset.copyMessage}${element.dataset.copyEmail}`);
		} catch (error) {
			console.error("No se pudo copiar el correo electrónico:", error);
		}
	});
});
