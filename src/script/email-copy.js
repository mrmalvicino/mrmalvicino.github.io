document.querySelectorAll("[data-copy-email]").forEach(element => {
	element.addEventListener("click", async event => {
		event.preventDefault();
		const status = element.parentElement.querySelector("[data-copy-status]");

		try {
			if (!navigator.clipboard) {
				throw new Error("Clipboard API is unavailable");
			}

			await navigator.clipboard.writeText(element.dataset.copyEmail);

			if (status) {
				status.textContent = `${element.dataset.copyMessage}${element.dataset.copyEmail}`;
			}
		} catch (error) {
			console.error("[email-copy] Clipboard write failed.", error);

			if (status) {
				status.textContent = element.dataset.copyFailure;
			}

			window.location.href = element.href;
		}
	});
});
