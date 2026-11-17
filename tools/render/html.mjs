export function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function attributes(values) {
	return Object.entries(values)
		.filter(([, value]) => value !== null && value !== undefined && value !== false)
		.map(([name, value]) => value === true ? name : `${name}="${escapeHtml(value)}"`)
		.join(" ");
}

export function html(strings, ...values) {
	let output = strings[0];

	for (let index = 0; index < values.length; index++) {
		const currentLine = output.slice(output.lastIndexOf("\n") + 1);
		const indentation = currentLine.match(/^[\t ]*/)[0];
		const value = String(values[index]).replaceAll("\n", `\n${indentation}`);

		output += value + strings[index + 1];
	}

	const lines = output.split("\n");

	if (lines[0].trim() === "") {
		lines.shift();
	}

	if (lines.at(-1)?.trim() === "") {
		lines.pop();
	}

	const indentationLengths = lines
		.filter(line => line.trim() !== "")
		.map(line => line.match(/^[\t ]*/)[0].length);

	const commonIndentation = Math.min(...indentationLengths);

	return lines.map(line => line.slice(commonIndentation)).join("\n");
}

export function publicUrl(value) {
	if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(value)) {
		return value;
	}

	const url = new URL(value, "https://local.invalid/");

	return `${url.pathname}${url.search}${url.hash}`;
}

export function image(imageData, className = "", imageAttributes = {}) {
	return `<img ${attributes({
		src: publicUrl(imageData.src),
		title: imageData.title,
		alt: imageData.alt,
		class: className || null,
		width: imageData.width,
		height: imageData.height,
		...imageAttributes
	})}>`;
}
