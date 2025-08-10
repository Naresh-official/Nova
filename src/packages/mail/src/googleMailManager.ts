import type { ManagerConfig, ThreadResponse } from "./types";
import { GmailClient } from "./core/gmailClient";
import { ThreadService } from "./services/thread";
import { MessageService } from "./services/message";
import { AttachmentService } from "./services/attachment";
import { EmailComposer } from "./services/emailComposer";
import { UnsubscribeService } from "./services/unsubscribe";
import { LabelService } from "./services/label";
import { type gmail_v1 } from "@googleapis/gmail";

export class GoogleMailManager {
	private client: GmailClient;
	private threadService: ThreadService;
	private messageService: MessageService;
	private attachmentService: AttachmentService;
	private emailComposer: EmailComposer;
	private unsubscribeService: UnsubscribeService;
	private labelService: LabelService;

	constructor(public config: ManagerConfig) {
		this.client = new GmailClient(config);
		this.threadService = new ThreadService(this.client);
		this.messageService = new MessageService(this.client);
		this.attachmentService = new AttachmentService(this.client);
		this.emailComposer = new EmailComposer(this.client);
		this.unsubscribeService = new UnsubscribeService(this.client);
		this.labelService = new LabelService(this.client);
	}

	// Delegate methods to respective services
	getScope() {
		return this.client.getScope();
	}
	async revokeToken() {
		return this.client.revokeToken();
	}

	async list(pageToken?: string, q?: string, labelIds?: string[]) {
		return this.threadService.list(pageToken, q, labelIds);
	}

	async listThreadIds() {
		return this.threadService.listThreadIds();
	}
	async getThread(threadId: string) {
		return this.threadService.getThread(threadId);
	}

	async markAsRead(threadId: string) {
		return this.messageService.markAsRead(threadId);
	}
	async trashThread(threadId: string) {
		return this.messageService.trashThread(threadId);
	}
	async toggleStar(threadId: string) {
		return this.messageService.toggleStar(threadId);
	}
	async moveToArchive(threadId: string) {
		return this.messageService.moveToArchive(threadId);
	}
	async moveToSpam(threadId: string) {
		return this.messageService.moveToSpam(threadId);
	}
	async markAsImportant(threadId: string) {
		return this.messageService.markAsImportant(threadId);
	}

	async getAttachmentBuffer(messageId: string, attachmentId: string) {
		return this.attachmentService.getAttachmentBuffer(messageId, attachmentId);
	}
	async getAttachments(thread: gmail_v1.Schema$Thread) {
		return this.attachmentService.getAttachments(thread);
	}

	async sendEmail(
		senderName: string,
		to: string[],
		subject: string,
		body: string,
		cc?: string[],
		bcc?: string[],
		attachments?: { filename: string; mimeType: string; data: string }[]
	) {
		return this.emailComposer.sendEmail(
			senderName,
			to,
			subject,
			body,
			cc,
			bcc,
			attachments
		);
	}

	async unsubscribeFromThread(threadId: string) {
		return this.unsubscribeService.unsubscribeFromThread(threadId);
	}

	async getLabels() {
		return this.labelService.getLabels();
	}

	async createLabel(label: {
		name: string;
		color?: { backgroundColor: string; textColor: string };
	}) {
		return this.labelService.createLabel(label);
	}
}
