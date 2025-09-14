import type { ManagerConfig, ThreadResponse } from "./types";
import { GmailClient } from "./core/gmailClient";
import { ThreadService } from "./services/thread.service";
import { MessageService } from "./services/message.service";
import { AttachmentService } from "./services/attachment.service";
import { EmailComposer } from "./services/emailComposer.service";
import { UnsubscribeService } from "./services/unsubscribe.service";
import { LabelService } from "./services/label.service";
import { DraftService } from "./services/draft.service";

export class GoogleMailManager {
	private client: GmailClient;

	public readonly threads: ThreadService;
	public readonly messages: MessageService;
	public readonly attachments: AttachmentService;
	public readonly emailComposer: EmailComposer;
	public readonly unsubscribe: UnsubscribeService;
	public readonly labels: LabelService;
	public readonly drafts: DraftService;

	constructor(public config: ManagerConfig) {
		this.client = new GmailClient(config);
		this.threads = new ThreadService(this.client);
		this.messages = new MessageService(this.client);
		this.attachments = new AttachmentService(this.client);
		this.emailComposer = new EmailComposer(this.client);
		this.unsubscribe = new UnsubscribeService(this.client);
		this.labels = new LabelService(this.client);
		this.drafts = new DraftService(this.client);
	}

	async revokeToken() {
		return this.client.revokeToken();
	}
}
