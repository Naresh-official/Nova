import { GmailClient } from "../core/gmailClient";

export class MessageService {
	constructor(private client: GmailClient) {}

	async markAsRead(threadId: string): Promise<void> {
		await this.client.gmail.users.messages.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				removeLabelIds: ["UNREAD"],
			},
		});
	}

	async trashThread(threadId: string): Promise<void> {
		await this.client.gmail.users.threads.trash({
			userId: "me",
			id: threadId,
		});
	}

	async toggleStar(threadId: string): Promise<void> {
		const threadService = new (await import("./thread")).ThreadService(
			this.client
		);
		const thread = await threadService.getThread(threadId);
		if (!thread) return Promise.reject("Thread not found");

		const isStarred = thread.messages?.some((message) =>
			message.labelIds?.includes("STARRED")
		);

		await this.client.gmail.users.messages.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				addLabelIds: isStarred ? [] : ["STARRED"],
				removeLabelIds: isStarred ? ["STARRED"] : [],
			},
		});
	}

	async moveToArchive(threadId: string): Promise<void> {
		await this.client.gmail.users.threads.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				removeLabelIds: ["INBOX"],
			},
		});
	}

	async moveToSpam(threadId: string): Promise<void> {
		await this.client.gmail.users.threads.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				addLabelIds: ["SPAM"],
				removeLabelIds: ["INBOX"],
			},
		});
	}

	async markAsImportant(threadId: string): Promise<void> {
		await this.client.gmail.users.messages.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				addLabelIds: ["IMPORTANT"],
			},
		});
	}
}
