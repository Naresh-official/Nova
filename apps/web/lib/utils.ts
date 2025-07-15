export function extractSenderName(sender: string): string {
	const match = sender.match(/^"?([^"<]+)"?\s*<.*>$/);
	return match ? match[1].trim() : sender;
}
