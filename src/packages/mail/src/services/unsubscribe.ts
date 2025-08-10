import { type gmail_v1 } from "@googleapis/gmail";
import { GmailClient } from "../core/gmailClient";
import {
	extractUnsubscribeLinks,
	getHeaderValue,
	unsubscribeViaEmail,
	unsubscribeViaHttp,
} from "../utils/gmail-unsubscribe-helpers";

export class UnsubscribeService {
	constructor(private client: GmailClient) {}

	async unsubscribeFromThread(threadId: string): Promise<void> {
		const thread = await this.client.gmail.users.threads.get({
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
				await unsubscribeViaEmail(this.client.gmail, mailtoLink);
				return;
			}
		}
	}
}
