import { ThreadResponseSchema } from "src/schemas";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const threadsRouter = router({
	listThreads: protectedProcedure
		.input(
			z.object({
				cursor: z.string().optional(),
			})
		)
		.output(
			z.object({
				emails: z.array(ThreadResponseSchema),
				nextCursor: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			// Keep as .query()
			const threads = await ctx.mailManager.list(input.cursor);
			return {
				emails: threads.emails,
				nextCursor: threads.nextPageToken,
			};
		}),

	listThreadIds: protectedProcedure
		.output(z.array(z.string()))
		.query(async ({ ctx }) => {
			const threads = await ctx.mailManager.listThreadIds();
			return threads;
		}),

	getThread: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const thread = await ctx.mailManager.getThread(input);
			if (!thread) {
				new TRPCError({
					code: "NOT_FOUND",
					message: `Thread with ID ${input} not found`,
				});
			}
			if (thread.messages?.[0]?.labelIds?.includes("UNREAD")) {
				await ctx.mailManager.markAsRead(input);
			}
			const attachments = await ctx.mailManager.getAttachments(thread);
			return { thread, attachments };
		}),

	trashThread: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.trashThread(input.threadId);
		}),

	toggleStar: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.toggleStar(input.threadId);
		}),

	moveToArchive: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.moveToArchive(input.threadId);
		}),

	moveToSpam: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.moveToSpam(input.threadId);
		}),

	unsubscribeFromThread: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.unsubscribeFromThread(input.threadId);
		}),

	markAsImportant: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.markAsImportant(input.threadId);
		}),

	getAttachment: protectedProcedure
		.input(
			z.object({
				messageId: z.string(),
				attachmentId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			try {
				const { buffer } = await ctx.mailManager.getAttachmentBuffer(
					input.messageId,
					input.attachmentId
				);

				// Return as base64 data URL for direct use in img src
				const base64Data = buffer.toString("base64");

				return {
					data: base64Data,
					size: buffer.length,
				};
			} catch (error: any) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to fetch attachment: ${error.message}`,
				});
			}
		}),
});
