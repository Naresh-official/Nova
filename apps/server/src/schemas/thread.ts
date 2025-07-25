import { z } from "zod";

export const ThreadResponseSchema = z.object({
	id: z.string().nullable().optional(),
	snippet: z.string(),
	isUnread: z.boolean(),
	isImportant: z.boolean(),
	isPersonal: z.boolean(),
	isStarred: z.boolean(),
	messageCount: z.number(),
	sender: z.string(),
	subject: z.string(),
	date: z.string(),
	internalDate: z.string().nullable().optional(),
});
