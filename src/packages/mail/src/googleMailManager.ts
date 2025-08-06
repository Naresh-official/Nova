import { OAuth2Client } from "google-auth-library";
import { type gmail_v1, gmail } from "@googleapis/gmail";
import { batchFetchImplementation } from "@jrmdayn/googleapis-batcher";
import type { ManagerConfig, ThreadResponse } from "./types";
import base64url from "base64url";
import {
	extractUnsubscribeLinks,
	getHeaderValue,
	unsubscribeViaEmail,
	unsubscribeViaHttp,
} from "./utils/gmail-unsubscribe-helpers";

export class GoogleMailManager {
	private auth;
	private gmail;

	constructor(public config: ManagerConfig) {
		this.auth = new OAuth2Client(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET
		);

		if (config.auth)
			this.auth.setCredentials({
				access_token: config.auth.accessToken,
				refresh_token: config.auth.refreshToken,
				scope: this.getScope(),
			});

		const fetchImpl = batchFetchImplementation();

		this.gmail = gmail({
			version: "v1",
			auth: this.auth,
			fetchImplementation: fetchImpl,
		});
	}

	private readonly systemLabelIds: string[] = [
		"INBOX",
		"TRASH",
		"SPAM",
		"DRAFT",
		"SENT",
		"STARRED",
		"UNREAD",
		"IMPORTANT",
		"CATEGORY_PERSONAL",
		"CATEGORY_SOCIAL",
		"CATEGORY_UPDATES",
		"CATEGORY_FORUMS",
		"CATEGORY_PROMOTIONS",
		"MUTED",
	];

	getScope(): string {
		return [
			"openid",
			"email",
			"https://www.googleapis.com/auth/gmail.modify",
			"https://www.googleapis.com/auth/gmail.readonly",
			"https://www.googleapis.com/auth/gmail.send",
			"https://www.googleapis.com/auth/gmail.labels",
			"https://www.googleapis.com/auth/gmail.compose",
		].join(" ");
	}

	private async getAccessToken(): Promise<string> {
		const credentials = await this.auth.getAccessToken();
		return credentials.token || "";
	}

	async revokeToken(): Promise<string> {
		const res = await this.auth.refreshAccessToken();
		return res.credentials.access_token || "";
	}

	async list(
		pageToken = "",
		q = "",
		labelIds: string[] = ["INBOX"]
	): Promise<{ emails: ThreadResponse[]; nextPageToken?: string }> {
		const res = await this.gmail.users.threads.list({
			userId: "me",
			labelIds: labelIds,
			maxResults: 20,
			pageToken,
			q,
		});

		if (!res.data.threads) return { emails: [], nextPageToken: undefined };

		const access_token = await this.getAccessToken();

		// Get user's email address to identify sent emails
		const profile = await this.gmail.users.getProfile({
			userId: "me",
		});
		const userEmail = profile.data.emailAddress;

		const threadDetails = await Promise.all(
			res.data.threads.map((thread) =>
				this.gmail.users.threads.get({
					userId: "me",
					id: thread.id!,
					format: "METADATA",
					metadataHeaders: ["From", "Subject", "Date"],
					access_token,
				})
			)
		);

		const threadsWithDetails = threadDetails
			.filter((response) => {
				const labelIds = response?.data?.messages?.[0]?.labelIds || [];
				const headers = response?.data?.messages?.[0]?.payload?.headers || [];
				const fromHeader = headers.find((h) => h.name === "From")?.value || "";

				const isInboxNotSent =
					labelIds.includes("INBOX") && !labelIds.includes("SENT");

				const isSentByUser =
					labelIds.includes("SENT") && fromHeader.includes(userEmail || "");

				return isInboxNotSent || isSentByUser;
			})
			.map((response) => {
				const threadData = response.data;

				const firstMessage = threadData.messages?.[0];
				const headers = firstMessage?.payload?.headers || [];

				const fromHeader = headers.find((h) => h.name === "From")?.value || "";
				const subjectHeader =
					headers.find((h) => h.name === "Subject")?.value || "";
				const dateHeader = headers.find((h) => h.name === "Date")?.value || "";

				return {
					id: threadData.id || "",
					snippet: firstMessage?.snippet || "",
					isUnread: firstMessage?.labelIds?.includes("UNREAD") || false,
					isImportant: firstMessage?.labelIds?.includes("IMPORTANT") || false,
					isPersonal:
						firstMessage?.labelIds?.includes("CATEGORY_PERSONAL") || false,
					isStarred: firstMessage?.labelIds?.includes("STARRED") || false,
					messageCount: threadData.messages?.length || 0,
					sender: fromHeader,
					subject: subjectHeader,
					date: dateHeader,
					internalDate: firstMessage?.internalDate || "",
				};
			});

		return {
			emails: threadsWithDetails,
			nextPageToken: res.data.nextPageToken || undefined,
		};
	}

	async listThreadIds(): Promise<string[]> {
		const res = await this.gmail.users.threads.list({
			userId: "me",
			labelIds: ["INBOX"],
			maxResults: 20,
		});

		if (!res.data.threads) return [];
		return res.data.threads.map((thread) => thread.id as string) || [];
	}

	async getThread(threadId: string) {
		const res = await this.gmail.users.threads.get({
			userId: "me",
			id: threadId,
			access_token: await this.getAccessToken(),
		});
		return res.data as gmail_v1.Schema$Thread;
	}

	async markAsRead(threadId: string): Promise<void> {
		const res = await this.gmail.users.messages.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				removeLabelIds: ["UNREAD"],
			},
		});
	}

	async trashThread(threadId: string): Promise<void> {
		await this.gmail.users.threads.trash({
			userId: "me",
			id: threadId,
		});
	}

	async toggleStar(threadId: string): Promise<void> {
		const thread = await this.getThread(threadId);
		if (!thread) return Promise.reject("Thread not found");

		const isStarred = thread.messages?.some((message) =>
			message.labelIds?.includes("STARRED")
		);
		await this.gmail.users.messages.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				addLabelIds: isStarred ? [] : ["STARRED"],
				removeLabelIds: isStarred ? ["STARRED"] : [],
			},
		});
	}

	async moveToArchive(threadId: string): Promise<void> {
		await this.gmail.users.threads.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				removeLabelIds: ["INBOX"],
			},
		});
	}

	async moveToSpam(threadId: string): Promise<void> {
		await this.gmail.users.threads.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				addLabelIds: ["SPAM"],
				removeLabelIds: ["INBOX"],
			},
		});
	}

	async unsubscribeFromThread(threadId: string): Promise<void> {
		const thread = await this.gmail.users.threads.get({
			userId: "me",
			id: threadId,
			format: "full",
		});

		const messages = thread.data.messages || [];

		for (const message of messages) {
			const headers = message.payload?.headers || [];

			const unsubscribeHeader = getHeaderValue(headers, "list-unsubscribe");
			const postHeader = getHeaderValue(headers, "list-unsubscribe-post");

			if (!unsubscribeHeader) continue;

			const links = extractUnsubscribeLinks(unsubscribeHeader);
			const httpLink = links.find((l) => l.startsWith("http"));
			const mailtoLink = links.find((l) => l.startsWith("mailto:"));

			if (httpLink) {
				await unsubscribeViaHttp(httpLink, postHeader || undefined);
				return;
			}

			if (mailtoLink) {
				await unsubscribeViaEmail(this.gmail, mailtoLink);
				return;
			}
		}
	}

	async markAsImportant(threadId: string): Promise<void> {
		await this.gmail.users.messages.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				addLabelIds: ["IMPORTANT"],
			},
		});
	}

	async getAttachmentBuffer(
		messageId: string,
		attachmentId: string
	): Promise<{ buffer: Buffer }> {
		try {
			const res = await this.gmail.users.messages.attachments.get({
				userId: "me",
				id: attachmentId,
				messageId: messageId,
			});

			if (!res.data.data) {
				throw new Error("No attachment data found");
			}

			// Gmail API returns base64url encoded data, decode it properly
			const buffer = base64url.toBuffer(res.data.data);

			return { buffer };
		} catch (error) {
			console.error("Error fetching attachment:", error);
			throw error;
		}
	}

	async getAttachments(thread: gmail_v1.Schema$Thread): Promise<
		{
			filename: string;
			mimeType: string;
			data: string; // base64
			size: number;
			src: string; // X-Attachment-Id or similar
		}[]
	> {
		const attachments: {
			filename: string;
			mimeType: string;
			data: string;
			size: number;
			src: string;
		}[] = [];

		for (const message of thread.messages ?? []) {
			const parts = message.payload?.parts ?? [];

			const traverseParts = (
				parts: gmail_v1.Schema$MessagePart[] = []
			): gmail_v1.Schema$MessagePart[] => {
				const result: gmail_v1.Schema$MessagePart[] = [];
				for (const part of parts) {
					if (part.parts) {
						result.push(...traverseParts(part.parts));
					} else {
						result.push(part);
					}
				}
				return result;
			};

			const flatParts = traverseParts(parts);

			for (const part of flatParts) {
				if (part.filename && part.body?.attachmentId && message.id) {
					try {
						const { buffer } = await this.getAttachmentBuffer(
							message.id,
							part.body.attachmentId
						);

						// Convert buffer to base64 for data URL
						const base64Data = buffer.toString("base64");
						const dataUrl = `data:${part.mimeType};base64,${base64Data}`;

						attachments.push({
							filename: part.filename,
							mimeType: part.mimeType ?? "application/octet-stream",
							data: dataUrl,
							size: buffer.length,
							src:
								part.headers
									?.filter((header) => header.name === "X-Attachment-Id")
									.map((header) => header.value)[0] || "",
						});
					} catch (error) {
						console.warn(
							`Failed to load attachment ${part.filename} from message ${message.id}:`,
							error
						);
					}
				}
			}
		}

		return attachments;
	}

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

		await this.gmail.users.messages.send({
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

		const profile = await this.gmail.users.getProfile({ userId: "me" });

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

		// Optional plain-text version (fallback)
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
