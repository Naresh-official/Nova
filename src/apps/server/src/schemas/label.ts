import { z } from "zod";

export const SchemaLabelColor = z.object({
	backgroundColor: z.string().nullable().optional(),
	textColor: z.string().nullable().optional(),
});

export const SchemaLabel = z.object({
	color: SchemaLabelColor.nullable().optional(),
	id: z.string().nullable().optional(),
	labelListVisibility: z.string().nullable().optional(),
	messageListVisibility: z.string().nullable().optional(),
	messagesTotal: z.number().nullable().optional(),
	messagesUnread: z.number().nullable().optional(),
	name: z.string().nullable().optional(),
	threadsTotal: z.number().nullable().optional(),
	threadsUnread: z.number().nullable().optional(),
	type: z.string().nullable().optional(),
});

export type SchemaLabelType = z.infer<typeof SchemaLabel>;
export type SchemaLabelColorType = z.infer<typeof SchemaLabelColor>;
