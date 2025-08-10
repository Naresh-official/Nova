import { type gmail_v1 } from "@googleapis/gmail";
import base64url from "base64url";
import { GmailClient } from "../core/gmailClient";

export class AttachmentService {
	constructor(private client: GmailClient) {}

	async getAttachmentBuffer(
		messageId: string,
		attachmentId: string
	): Promise<{ buffer: Buffer }> {
		try {
			const res = await this.client.gmail.users.messages.attachments.get({
				userId: "me",
				id: attachmentId,
				messageId: messageId,
			});

			if (!res.data.data) {
				throw new Error("No attachment data found");
			}

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
			data: string;
			size: number;
			src: string;
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
			const flatParts = this.traverseParts(parts);

			for (const part of flatParts) {
				if (part.filename && part.body?.attachmentId && message.id) {
					try {
						const { buffer } = await this.getAttachmentBuffer(
							message.id,
							part.body.attachmentId
						);

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

	private traverseParts(
		parts: gmail_v1.Schema$MessagePart[] = []
	): gmail_v1.Schema$MessagePart[] {
		const result: gmail_v1.Schema$MessagePart[] = [];
		for (const part of parts) {
			if (part.parts) {
				result.push(...this.traverseParts(part.parts));
			} else {
				result.push(part);
			}
		}
		return result;
	}
}
