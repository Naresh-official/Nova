import base64url from "base64url";
import { GmailClient } from "../core/gmailClient";

export class EmailComposer {
	constructor(private client: GmailClient) {}

	async sendEmail(
		senderName: string,
		to: string[],
		subject: string,
		body: string,
		cc: string[] = [],
		bcc: string[] = [],
		attachments: { filename: string; mimeType: string; data: string }[] = []
	): Promise<void> {
		const rawMessage = await this.createRawMessage(
			senderName,
			to,
			subject,
			body,
			cc,
			bcc,
			attachments
		);

		await this.client.gmail.users.messages.send({
			userId: "me",
			requestBody: {
				raw: base64url.encode(rawMessage),
			},
		});
	}

	private async createRawMessage(
		senderName: string,
		to: string[],
		subject: string,
		body: string,
		cc: string[] = [],
		bcc: string[] = [],
		attachments: { filename: string; mimeType: string; data: string }[] = []
	): Promise<string> {
		const boundaryMixed = `mixed_${Date.now()}`;
		const boundaryAlt = `alt_${Date.now()}`;

		const profile = await this.client.getUserProfile();
		const senderEmail = profile.data.emailAddress;

		let message = `From: ${senderName} <${senderEmail}>\r\n`;
		message += `To: ${to.join(", ")}\r\n`;
		if (cc.length > 0) message += `Cc: ${cc.join(", ")}\r\n`;
		if (bcc.length > 0) message += `Bcc: ${bcc.join(", ")}\r\n`;
		message += `Subject: ${subject}\r\n`;
		message += `MIME-Version: 1.0\r\n`;
		message += `Content-Type: multipart/mixed; boundary="${boundaryMixed}"\r\n\r\n`;

		// Start alternative section (plain text + HTML)
		message += `--${boundaryMixed}\r\n`;
		message += `Content-Type: multipart/alternative; boundary="${boundaryAlt}"\r\n\r\n`;

		// Plain-text version (fallback)
		message += `--${boundaryAlt}\r\n`;
		message += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
		message += `This is an HTML email. Please view in an HTML-compatible email client.\r\n\r\n`;

		// HTML version
		message += `--${boundaryAlt}\r\n`;
		message += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
		message += `${body}\r\n\r\n`;

		message += `--${boundaryAlt}--\r\n`;

		// Attachments (if any)
		for (const attachment of attachments) {
			message += `--${boundaryMixed}\r\n`;
			message += `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"\r\n`;
			message += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n`;
			message += `Content-Transfer-Encoding: base64\r\n\r\n`;
			message += `${attachment.data}\r\n\r\n`;
		}

		message += `--${boundaryMixed}--`;
		return message;
	}
}
