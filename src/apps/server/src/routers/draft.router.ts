import { DraftResponseSchema } from "src/schemas/draft.schema";
import { protectedProcedure, router } from "src/trpc";
import { z } from "zod";

export const draftRouter = router({
	listDrafts: protectedProcedure
		.output(z.array(DraftResponseSchema))
		.query(async ({ ctx }) => {
			const drafts = await ctx.mailManager.drafts.listDrafts();
			return drafts;
		}),
});
