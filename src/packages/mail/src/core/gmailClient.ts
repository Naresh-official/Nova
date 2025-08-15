import { OAuth2Client } from "google-auth-library";
import { type gmail_v1, gmail } from "@googleapis/gmail";
import { batchFetchImplementation } from "@jrmdayn/googleapis-batcher";
import type { ManagerConfig } from "../types";

export class GmailClient {
	private auth: OAuth2Client;
	public gmail: gmail_v1.Gmail;

	constructor(config: ManagerConfig) {
		this.auth = new OAuth2Client(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET
		);

		if (config.auth) {
			this.auth.setCredentials({
				access_token: config.auth.accessToken,
				refresh_token: config.auth.refreshToken,
				scope: this.getScope(),
			});
		}

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

	async getAccessToken(): Promise<string> {
		const credentials = await this.auth.getAccessToken();
		return credentials.token || "";
	}

	async revokeToken(): Promise<string> {
		const res = await this.auth.refreshAccessToken();
		return res.credentials.access_token || "";
	}

	async getUserProfile() {
		const res = await this.gmail.users.getProfile({ userId: "me" });
		return res.data;
	}
}
