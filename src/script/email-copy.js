document.querySelectorAll("[data-copy-email]").forEach(element => {
	element.addEventListener("click", async event => {
		event.preventDefault();
		const status = element.parentElement.querySelector("[data-copy-status]");

		try {
			await navigator.clipboard.writeText(element.dataset.copyEmail);
			status.textContent = `${element.dataset.copyMessage}${element.dataset.copyEmail}`;
		} catch (error) {
			console.error("No se pudo copiar el correo electrónico:", error);
			status.textContent = element.dataset.copyFailure;
			window.location.href = element.href;
		}
	});
});
