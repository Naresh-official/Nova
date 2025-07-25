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

	async list(): Promise<ThreadResponse[]> {
		const res = await this.gmail.users.threads.list({
			userId: "me",
			labelIds: ["INBOX"],
			maxResults: 20,
		});

		if (!res.data.threads) return [];

		const access_token = await this.getAccessToken();

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

		const threadsWithDetails = threadDetails.map((response) => {
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

		return threadsWithDetails;
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
}
