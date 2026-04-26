import type { gmail_v1 } from "@googleapis/gmail";
import type { GmailClient } from "../core/gmailClient";
import type { DraftResponse } from "../types";
import { createRawMessage } from "../utils/createRawMessage";

export class DraftService {
	constructor(private client: GmailClient) {}

	async listDrafts() {
		const res = await this.client.gmail.users.drafts.list({
			userId: "me",
		});

		if (!res.data.drafts) return [];

		const access_token = await this.client.getAccessToken();
		const userEmail = (await this.client.getUserProfile())
			.emailAddress as string;

		const draftDetails = await Promise.all(
			res.data.drafts.map(async (draft) => {
				const response = await this.client.gmail.users.drafts.get({
					userId: "me",
					id: draft.id!,
					format: "METADATA",
					access_token,
				});
				return response.data;
			})
		);

		return this.processDraftDetails(draftDetails, userEmail);
	}

	private processDraftDetails(
		draftDetails: gmail_v1.Schema$Draft[],
		userEmail?: string
	): DraftResponse[] {
		return draftDetails.map((draft) => {
			const message = draft.message;
			const headers = message?.payload?.headers || [];

			const fromHeader =
				headers.find((h: any) => h.name === "From")?.value || userEmail || "";
			const subjectHeader =
				headers.find((h: any) => h.name === "Subject")?.value || "";
			const dateHeader =
				headers.find((h: any) => h.name === "Date")?.value || "";

			return {
				id: draft.id as string,
				snippet: message?.snippet as string,
				sender: fromHeader,
				subject: subjectHeader,
				date: dateHeader,
				internalDate: message?.internalDate as string,
				threadId: message?.threadId as string,
			};
		});
	}

	async createDraft(
		senderName: string,
		to: string[],
		subject: string,
		body: string,
		cc: string[] = [],
		bcc: string[] = [],
		attachments: { filename: string; mimeType: string; data: string }[] = []
	) {
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

		await this.client.gmail.users.drafts.create({
			userId: "me",
			requestBody: {
				message: {
					raw: rawMessage,
				},
			},
		});
	}

	async updateDraft(
		senderName: string,
		to: string[],
		subject: string,
		body: string,
		cc: string[] = [],
		bcc: string[] = [],
		attachments: { filename: string; mimeType: string; data: string }[] = [],
		draftId: string
	) {
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

		await this.client.gmail.users.drafts.update({
			userId: "me",
			id: draftId,
			requestBody: {
				message: {
					raw: rawMessage,
				},
			},
		});
	}

	async getDraft(draftId: string) {
		const res = await this.client.gmail.users.drafts.get({
			userId: "me",
			id: draftId,
		});

		return res.data;
	}

	async deleteDraft(draftId: string) {
		await this.client.gmail.users.drafts.delete({
			userId: "me",
			id: draftId,
		});
	}
}
