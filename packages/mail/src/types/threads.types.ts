export interface ThreadResponse {
	id: string;
	snippet: string;
	isUnread: boolean;
	isImportant: boolean;
	isPersonal: boolean;
	isStarred: boolean;
	messageCount: number;
	sender: string;
	to: string;
	subject: string;
	date: string;
	internalDate: string;
	customLabels: string[];
}
