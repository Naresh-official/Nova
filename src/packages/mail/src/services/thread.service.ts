import { type gmail_v1 } from "@googleapis/gmail";
import type { ThreadResponse } from "../types";
import { GmailClient } from "../core/gmailClient";

export class ThreadService {
	private static readonly SYSTEM_LABEL_IDS = [
		"INBOX",
		"TRASH",
		"SPAM",
		"DRAFT",
		"SENT",
		"STARRED",
		"YELLOW_STAR",
		"UNREAD",
		"IMPORTANT",
		"CATEGORY_PERSONAL",
		"CATEGORY_SOCIAL",
		"CATEGORY_UPDATES",
		"CATEGORY_FORUMS",
		"CATEGORY_PROMOTIONS",
		"MUTED",
		"ARCHIVE",
	];

	constructor(private client: GmailClient) {}

	async list(
		pageToken = "",
		q = "",
		labelIds: string[] = [],
		folder: string | undefined
	): Promise<{ emails: ThreadResponse[]; nextPageToken?: string }> {
		const effectiveLabelIds = this.getEffectiveLabelIds(labelIds, folder);
		const effectiveQuery = this.buildEffectiveQuery(q, folder);

		const res = await this.client.gmail.users.threads.list({
			userId: "me",
			labelIds: effectiveLabelIds,
			maxResults: 20,
			pageToken,
			q: effectiveQuery,
		});

		if (!res.data.threads) return { emails: [], nextPageToken: undefined };

		const access_token = await this.client.getAccessToken();
		const profile = await this.client.getUserProfile();
		const userEmail = profile.data.emailAddress;

		const threadDetails = await Promise.all(
			res.data.threads.map(
				async (thread) =>
					(
						await this.client.gmail.users.threads.get({
							userId: "me",
							id: thread.id!,
							format: "METADATA",
							metadataHeaders: ["From", "Subject", "Date"],
							access_token,
						})
					).data
			)
		);

		const threadsWithDetails = this.processThreadDetails(
			threadDetails,
			userEmail || undefined,
			folder
		);

		return {
			emails: threadsWithDetails,
			nextPageToken: res.data.nextPageToken || undefined,
		};
	}

	async listThreadIds(): Promise<string[]> {
		const res = await this.client.gmail.users.threads.list({
			userId: "me",
			labelIds: ["INBOX"],
			maxResults: 20,
		});

		if (!res.data.threads) return [];
		return res.data.threads.map((thread) => thread.id as string) || [];
	}

	async getThread(threadId: string) {
		const res = await this.client.gmail.users.threads.get({
			userId: "me",
			id: threadId,
			access_token: await this.client.getAccessToken(),
		});
		return res.data as gmail_v1.Schema$Thread;
	}

	private getEffectiveLabelIds(
		labelIds: string[],
		folder: string | undefined
	): string[] {
		if (folder) {
			// For ARCHIVE, we use Gmail search query instead of labelIds
			if (folder.toUpperCase() === "ARCHIVE") {
				return [];
			}
			return [folder.toUpperCase()];
		}
		return labelIds;
	}

	private buildEffectiveQuery(q: string, folder?: string): string {
		if (folder?.toUpperCase() === "ARCHIVE") {
			const archiveQuery = "in:archive";
			return q ? `${archiveQuery} ${q}` : archiveQuery;
		}
		return q;
	}

	private processThreadDetails(
		threadDetails: gmail_v1.Schema$Thread[],
		userEmail?: string,
		folder?: string
	): ThreadResponse[] {
		return threadDetails
			.filter((response) => {
				const labelIds = response?.messages?.[0]?.labelIds || [];
				const headers = response?.messages?.[0]?.payload?.headers || [];
				const fromHeader =
					headers.find((h: any) => h.name === "From")?.value || "";

				if (folder) {
					const folderLabel = folder.toUpperCase();

					if (folderLabel === "ARCHIVE") {
						return !labelIds.includes("INBOX");
					}

					if (folderLabel === "SENT") {
						return labelIds.includes("SENT");
					}

					return labelIds.includes(folderLabel);
				}

				const isInboxNotSent =
					labelIds.includes("INBOX") && !labelIds.includes("SENT");
				const isSentByUser =
					labelIds.includes("SENT") && fromHeader.includes(userEmail || "");

				return isInboxNotSent || isSentByUser;
			})
			.map((response) => {
				const firstMessage = response.messages?.[0];
				const headers = firstMessage?.payload?.headers || [];

				const fromHeader =
					headers.find((h: any) => h.name === "From")?.value || "";
				const subjectHeader =
					headers.find((h: any) => h.name === "Subject")?.value || "";
				const dateHeader =
					headers.find((h: any) => h.name === "Date")?.value || "";

				const customLabels = firstMessage?.labelIds?.filter(
					(label) => !ThreadService.SYSTEM_LABEL_IDS.includes(label)
				);

				return {
					id: response.id || "",
					snippet: firstMessage?.snippet || "",
					isUnread: firstMessage?.labelIds?.includes("UNREAD") || false,
					isImportant: firstMessage?.labelIds?.includes("IMPORTANT") || false,
					isPersonal:
						firstMessage?.labelIds?.includes("CATEGORY_PERSONAL") || false,
					isStarred: firstMessage?.labelIds?.includes("STARRED") || false,
					messageCount: response.messages?.length || 0,
					sender: fromHeader,
					subject: subjectHeader,
					date: dateHeader,
					internalDate: firstMessage?.internalDate || "",
					customLabels: customLabels || [],
				};
			});
	}
}
