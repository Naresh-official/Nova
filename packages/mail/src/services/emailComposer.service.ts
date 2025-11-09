import { GmailClient } from "../core/gmailClient";
import { createRawMessage } from "../utils/createRawMessage";

export class EmailComposer {
	constructor(private client: GmailClient) {}

	async sendEmail({
		senderName,
		to,
		subject,
		body,
		cc = [],
		bcc = [],
		attachments = [],
	}: {
		senderName: string;
		to: string[];
		subject: string;
		body: string;
		cc?: string[];
		bcc?: string[];
		attachments?: { filename: string; mimeType: string; data: string }[];
	}): Promise<void> {
		const senderEmail = (await this.client.getUserProfile())
			.emailAddress as string;
		const rawMessage = await createRawMessage({
			senderName,
			to,
			subject,
			body,
			cc,
			bcc,
			attachments,
			senderEmail,
		});

		await this.client.gmail.users.messages.send({
			userId: "me",
			requestBody: {
				raw: rawMessage,
			},
		});
	}

	async replyToEmail({
		senderName,
		body,
		threadId,
	}: {
		senderName: string;
		body: string;
		threadId: string;
	}): Promise<void> {
		const senderEmail = (await this.client.getUserProfile())
			.emailAddress as string;

		const thread = await this.client.gmail.users.threads.get({
			userId: "me",
			id: threadId,
		});

		const lastMessage = thread.data.messages?.[thread.data.messages.length - 1];

		const lastMessageFrom =
			lastMessage?.payload?.headers?.find((header) => header.name === "From")
				?.value || "";

		const cc =
			lastMessage?.payload?.headers
				?.find((header) => header.name === "Cc")
				?.value?.split(", ")
				.filter(
					(email) => email !== senderEmail && email !== lastMessageFrom
				) || [];

		const bcc =
			lastMessage?.payload?.headers
				?.find((header) => header.name === "Bcc")
				?.value?.split(", ")
				.filter(
					(email) => email !== senderEmail && email !== lastMessageFrom
				) || [];

		const firstMessageSubject =
			thread.data.messages?.[0].payload?.headers?.find(
				(header) => header.name === "Subject"
			)?.value || "";

		const lastMessageId =
			lastMessage?.payload?.headers?.find(
				(header) => header.name === "Message-ID"
			)?.value || "";

		const rawMessage = await createRawMessage({
			senderName,
			body,
			senderEmail,
			inReplyTo: lastMessageId,
			subject: firstMessageSubject,
			to: [lastMessageFrom],
			cc,
			bcc,
		});

		await this.client.gmail.users.messages.send({
			userId: "me",
			requestBody: {
				raw: rawMessage,
				threadId: undefined, // Gmail will auto-thread based on headers
			},
		});
	}
}
