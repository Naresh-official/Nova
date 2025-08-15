import { TRPCError } from "@trpc/server";
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

	saveDraft: protectedProcedure
		.input(
			z.object({
				senderName: z.string().min(1),
				to: z.array(z.string().email()),
				subject: z.string().min(1),
				body: z.string().min(1),
				cc: z.array(z.string().email()).optional(),
				bcc: z.array(z.string().email()).optional(),
				attachments: z
					.array(
						z.object({
							filename: z.string(),
							mimeType: z.string(),
							data: z.string(),
						})
					)
					.optional(),
				draftId: z.string().optional(),
			})
		)
		.output(
			z.object({
				success: z.boolean(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { senderName, to, subject, body, cc, bcc, attachments, draftId } =
				input;

			try {
				if (draftId) {
					await ctx.mailManager.drafts.updateDraft(
						senderName,
						to,
						subject,
						body,
						cc || [],
						bcc || [],
						attachments || [],
						draftId
					);
				} else {
					await ctx.mailManager.drafts.createDraft(
						senderName,
						to,
						subject,
						body,
						cc || [],
						bcc || [],
						attachments || []
					);
				}

				return { success: true };
			} catch (error) {
				console.error("Failed to create draft:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create draft",
				});
			}
		}),

	getDraft: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const draft = await ctx.mailManager.drafts.getDraft(input);
			if (!draft) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Draft not found",
				});
			}
			return draft;
		}),

	deleteDraft: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.mailManager.drafts.deleteDraft(input);
				return { success: true };
			} catch (error) {
				console.error("Failed to delete draft:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete draft",
				});
			}
		}),
});
