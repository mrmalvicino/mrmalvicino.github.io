const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
	const submitButton = contactForm.querySelector('button[type="submit"]');
	const status = contactForm.querySelector("[data-form-status]");

	if (!submitButton || !status) {
		console.error("[contact-form] Initialization failed: required elements are missing.");
	} else {
		contactForm.addEventListener("submit", async event => {
			event.preventDefault();

			if (!contactForm.reportValidity()) {
				return;
			}

			const controller = new AbortController();
			const timeout = window.setTimeout(() => controller.abort(), 15000);

			contactForm.setAttribute("aria-busy", "true");
			submitButton.disabled = true;
			status.dataset.state = "pending";
			status.setAttribute("role", "status");
			status.setAttribute("aria-live", "polite");
			status.textContent = contactForm.dataset.submittingMessage;

			try {
				const response = await fetch(contactForm.action, {
					method: contactForm.method,
					body: new FormData(contactForm),
					headers: { Accept: "application/json" },
					signal: controller.signal
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				contactForm.reset();
				status.dataset.state = "success";
				status.setAttribute("role", "status");
				status.setAttribute("aria-live", "polite");
				status.textContent = contactForm.dataset.successMessage;
			} catch (error) {
				console.error("[contact-form] Submission failed.", {
					cause: error instanceof Error ? error.message : String(error)
				});
				status.dataset.state = "error";
				status.setAttribute("role", "alert");
				status.setAttribute("aria-live", "assertive");
				status.textContent = error instanceof Error && error.message.startsWith("HTTP ")
					? contactForm.dataset.serverErrorMessage
					: contactForm.dataset.networkErrorMessage;
			} finally {
				window.clearTimeout(timeout);
				contactForm.removeAttribute("aria-busy");
				submitButton.disabled = false;
			}
		});
	}
}
