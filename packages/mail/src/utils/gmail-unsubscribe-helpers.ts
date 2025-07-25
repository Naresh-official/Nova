import { gmail_v1 } from "@googleapis/gmail";
import base64url from "base64url";

/**
 * Extracts the value of a specific header from a list of Gmail headers.
 */
export function getHeaderValue(
	headers: gmail_v1.Schema$MessagePartHeader[] = [],
	key: string
): string | null {
	return (
		headers.find((h) => h.name?.toLowerCase() === key.toLowerCase())?.value ||
		null
	);
}

/**
 * Parses the List-Unsubscribe header and returns all URLs or mailto links.
 */
export function extractUnsubscribeLinks(headerValue: string): string[] {
	return (
		headerValue.match(/<([^>]+)>/g)?.map((s) => s.slice(1, -1).trim()) || []
	);
}

/**
 * Sends a GET or POST unsubscribe request based on the List-Unsubscribe-Post header.
 */
export async function unsubscribeViaHttp(
	link: string,
	postHeader?: string
): Promise<void> {
	const isOneClick = postHeader?.toLowerCase() === "list-unsubscribe=one-click";

	const res = await fetch(link, {
		method: isOneClick ? "POST" : "GET",
		headers: isOneClick ? { "Content-Length": "0" } : {},
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Unsubscribe via HTTP failed (${res.status}): ${text}`);
	}
}

/**
 * Sends a basic unsubscribe email using the Gmail API.
 */
export async function unsubscribeViaEmail(
	gmail: gmail_v1.Gmail,
	mailto: string
): Promise<void> {
	const email = mailto.replace(/^mailto:/i, "").trim();

	const rawMessage = [
		`To: ${email}`,
		`Subject: Unsubscribe`,
		`Content-Type: text/plain; charset="UTF-8"`,
		``,
		`Please unsubscribe me from this mailing list.`,
	].join("\n");

	const encoded = base64url(rawMessage);

	const res = await gmail.users.messages.send({
		userId: "me",
		requestBody: { raw: encoded },
	});

	if (!res.status || res.status >= 300) {
		throw new Error(`Failed to send unsubscribe email to ${email}`);
	}
}
