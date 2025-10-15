import base64url from "base64url";
import { GmailClient } from "../core/gmailClient";
import { createMimeMessage } from "mimetext";
import { sanitizeTipTapHtml } from "../utils/sanitizeTipTapHtml";
import { createRawMessage } from "../utils/createRawMessage";

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
		const senderEmail = (await this.client.getUserProfile())
			.emailAddress as string;
		const rawMessage = await createRawMessage(
			senderName,
			to,
			subject,
			body,
			cc,
			bcc,
			attachments,
			senderEmail
		);

		await this.client.gmail.users.messages.send({
			userId: "me",
			requestBody: {
				raw: rawMessage,
			},
		});
	}
}
