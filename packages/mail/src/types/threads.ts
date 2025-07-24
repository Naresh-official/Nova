export interface ThreadResponse {
	id: string;
	snippet: string;
	isUnread: boolean;
	isImportant: boolean;
	isPersonal: boolean;
	messageCount: number;
	sender: string;
	subject: string;
	date: string;
	internalDate: string;
}
