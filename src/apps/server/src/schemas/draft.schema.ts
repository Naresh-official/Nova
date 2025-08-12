import { z } from "zod";

export const DraftResponseSchema = z.object({
	id: z.string(),
	snippet: z.string(),
	sender: z.string(),
	subject: z.string(),
	date: z.string(),
	internalDate: z.string(),
	threadId: z.string(),
});
