export interface TRPCThreadResponse {
	id: string;
	snippet: string;
	isUnread: boolean;
	isImportant: boolean;
	messageCount: number;
	sender: string;
	subject: string;
	date: string;
	internalDate: string;
}
