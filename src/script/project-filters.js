const filters = document.querySelector("#project-filters");
const cards = [...document.querySelectorAll("#projects-list > .project-card")];
const resultCount = document.querySelector("#project-result-count");
const emptyState = document.querySelector("#project-empty-state");
const clearButtons = [...document.querySelectorAll("[data-clear-filters]")];
const filterGroups = ["tech", "type", "contribution"];
const canInitialize = filters && resultCount && emptyState && cards.every(card =>
	typeof card.dataset.technologies === "string" &&
	typeof card.dataset.types === "string" &&
	typeof card.dataset.participationMode === "string");

if (canInitialize) {
	function getCheckboxes(group) {
		return [...filters.querySelectorAll(`input[name="${group}"]`)];
	}

	function getSelectedIds(group) {
		return new Set(getCheckboxes(group)
			.filter(checkbox => checkbox.checked)
			.map(checkbox => checkbox.value));
	}

	function restoreFiltersFromUrl() {
		const searchParams = new URLSearchParams(window.location.search);

		for (const group of filterGroups) {
			const selectedIds = new Set((searchParams.get(group) ?? "").split(",").filter(Boolean));

			for (const checkbox of getCheckboxes(group)) {
				checkbox.checked = selectedIds.has(checkbox.value);
			}
		}
	}

	function updateUrl(method = "pushState") {
		try {
			const url = new URL(window.location.href);

			for (const group of filterGroups) {
				const selectedIds = [...getSelectedIds(group)].sort();

				if (selectedIds.length > 0) {
					url.searchParams.set(group, selectedIds.join(","));
				} else {
					url.searchParams.delete(group);
				}
			}

			window.history[method](null, "", url);
		} catch (error) {
			console.error("[project-filters] URL synchronization failed.", error);
		}
	}

	function applyFilters() {
		const selectedTechnologies = getSelectedIds("tech");
		const selectedTypes = getSelectedIds("type");
		const selectedContributions = getSelectedIds("contribution");
		let visibleCount = 0;

		for (const card of cards) {
			const technologies = new Set(card.dataset.technologies.split(" "));
			const types = new Set(card.dataset.types.split(" "));
			const matchesTechnology = selectedTechnologies.size === 0 ||
				[...selectedTechnologies].some(id => technologies.has(id));
			const matchesType = selectedTypes.size === 0 ||
				[...selectedTypes].some(id => types.has(id));
			const matchesContribution = selectedContributions.size === 0 ||
				selectedContributions.has(card.dataset.participationMode);
			const isVisible = matchesTechnology && matchesType && matchesContribution;

			card.hidden = !isVisible;

			if (isVisible) {
				visibleCount += 1;
			}
		}

		const hasActiveFilters = selectedTechnologies.size > 0 ||
			selectedTypes.size > 0 ||
			selectedContributions.size > 0;
		const resultLabel = visibleCount === 1 ? resultCount.dataset.singular : resultCount.dataset.plural;

		resultCount.textContent = `${visibleCount} ${resultLabel}`;
		emptyState.hidden = visibleCount !== 0;

		for (const button of clearButtons) {
			button.disabled = !hasActiveFilters;
		}
	}

	function clearFilters() {
		for (const checkbox of filters.querySelectorAll('input[type="checkbox"]')) {
			checkbox.checked = false;
		}

		updateUrl();
		applyFilters();
	}

	filters.addEventListener("change", () => {
		updateUrl();
		applyFilters();
	});

	for (const button of clearButtons) {
		button.addEventListener("click", clearFilters);
	}

	window.addEventListener("popstate", () => {
		restoreFiltersFromUrl();
		applyFilters();
	});

	restoreFiltersFromUrl();
	updateUrl("replaceState");
	filters.hidden = false;
	applyFilters();
} else if (filters) {
	console.error("[project-filters] Initialization failed: required data is missing.");
}
