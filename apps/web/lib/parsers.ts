export function extractSenderName(sender: string): string {
  const match = sender.match(/^"?([^"<]+)"?\s*<.*>$/);
  return match ? match[1].trim() : sender;
}

export function extractSenderEmail(sender: string): string {
  const match = sender.match(/<([^>]+)>/);
  return match ? match[1].trim() : sender;
}

export function formatDateString(dateNumber: number): string {
	const date = new Date(dateNumber);
	const month = date.toLocaleDateString("en-US", { month: "short" });
	const day = date.getDate();
	return `${month} ${day}`;
}

export function formatTimeString(dateNumber: number): string {
	const date = new Date(dateNumber);
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getDomainFromEmail(email: string): string {
	if (!email || !email.includes("@")) {
		return "";
	}

	const domain = email.split("@")[1].toLowerCase();

	const parts = domain.split(".");
	if (parts.length >= 2) {
		if (parts.length >= 3) {
			return parts.slice(-2).join(".");
		}
		return domain;
	}

	return domain;
}
