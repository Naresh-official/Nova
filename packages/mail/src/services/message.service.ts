import { GmailClient } from "../core/gmailClient";
import { ThreadService } from "./thread.service";

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

	async markAsUnread(threadId: string): Promise<void> {
		await this.client.gmail.users.messages.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				addLabelIds: ["UNREAD"],
			},
		});
	}

	async trashThread(threadId: string): Promise<void> {
		await this.client.gmail.users.threads.trash({
			userId: "me",
			id: threadId,
		});
	}

	async restoreThread(threadId: string): Promise<void> {
		await this.client.gmail.users.threads.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				removeLabelIds: ["TRASH"],
				addLabelIds: ["INBOX"],
			},
		});
	}

	async toggleStar(threadId: string): Promise<void> {
		const threadService = new ThreadService(this.client);
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

	async addLabelToThread(threadId: string, labelId: string): Promise<void> {
		await this.client.gmail.users.messages.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				addLabelIds: [labelId],
			},
		});
	}

	async removeLabelFromThread(
		threadId: string,
		labelId: string
	): Promise<void> {
		await this.client.gmail.users.messages.modify({
			userId: "me",
			id: threadId,
			requestBody: {
				removeLabelIds: [labelId],
			},
		});
	}
}
