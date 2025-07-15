import { OAuth2Client } from "google-auth-library";
import { type gmail_v1, gmail } from "@googleapis/gmail";
import { batchFetchImplementation } from "@jrmdayn/googleapis-batcher";
import type { ManagerConfig, TRPCThreadResponse } from "src/types";

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

	async list(): Promise<TRPCThreadResponse[]> {
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

			const fromHeader =
				headers.find((h) => h.name === "From")?.value || "";
			const subjectHeader =
				headers.find((h) => h.name === "Subject")?.value || "";
			const dateHeader =
				headers.find((h) => h.name === "Date")?.value || "";

			return {
				id: threadData.id || "",
				snippet: firstMessage?.snippet || "",
				isUnread: firstMessage?.labelIds?.includes("UNREAD") || false,
				messageCount: threadData.messages?.length || 0,
				sender: fromHeader,
				subject: subjectHeader,
				date: dateHeader,
				internalDate: firstMessage?.internalDate || "",
			};
		});

		return threadsWithDetails;
	}

	async getThread(threadId: string) {
		const res = await this.gmail.users.threads.get({
			userId: "me",
			id: threadId,
			format: "METADATA",
			metadataHeaders: ["From", "Subject", "Date"],
			access_token: await this.getAccessToken(),
		});
		return res.data as gmail_v1.Schema$Thread;
	}
}
