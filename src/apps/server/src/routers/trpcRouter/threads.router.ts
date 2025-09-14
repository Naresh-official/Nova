import { ThreadResponseSchema } from "@server/schemas";
import { protectedProcedure, router } from "@server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const allowedLabelIds = z.enum([
	"INBOX",
	"STARRED",
	"UNREAD",
	"IMPORTANT",
	"CATEGORY_PERSONAL",
	"CATEGORY_SOCIAL",
	"CATEGORY_UPDATES",
	"CATEGORY_FORUMS",
	"CATEGORY_PROMOTIONS",
]);

export const threadsRouter = router({
	listThreads: protectedProcedure
		.input(
			z.object({
				cursor: z.string().optional(),
				q: z.string().optional(),
				labelIds: z.array(allowedLabelIds).optional(),
				folder: z.string().optional(),
			})
		)
		.output(
			z.object({
				emails: z.array(ThreadResponseSchema),
				nextCursor: z.string().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { cursor, q, labelIds, folder } = input;

			const threads = await ctx.mailManager.threads.list(
				cursor,
				q,
				labelIds,
				folder
			);
			return {
				emails: threads.emails,
				nextCursor: threads.nextPageToken,
			};
		}),

	listThreadIds: protectedProcedure
		.output(z.array(z.string()))
		.query(async ({ ctx }) => {
			const threads = await ctx.mailManager.threads.listThreadIds();
			return threads;
		}),

	getThread: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const thread = await ctx.mailManager.threads.getThread(input);
			if (!thread) {
				new TRPCError({
					code: "NOT_FOUND",
					message: `Thread with ID ${input} not found`,
				});
			}
			if (thread.messages?.[0]?.labelIds?.includes("UNREAD")) {
				await ctx.mailManager.messages.markAsRead(input);
			}
			const attachments =
				await ctx.mailManager.attachments.getAttachments(thread);
			return { thread, attachments };
		}),

	trashThread: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.messages.trashThread(input.threadId);
		}),

	restoreThread: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.messages.restoreThread(input.threadId);
		}),

	toggleStar: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.messages.toggleStar(input.threadId);
		}),

	moveToArchive: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.messages.moveToArchive(input.threadId);
		}),

	moveToSpam: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.messages.moveToSpam(input.threadId);
		}),

	unsubscribeFromThread: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.unsubscribe.unsubscribeFromThread(input.threadId);
		}),

	markAsImportant: protectedProcedure
		.input(z.object({ threadId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.messages.markAsImportant(input.threadId);
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
				const { buffer } =
					await ctx.mailManager.attachments.getAttachmentBuffer(
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

	markAsRead: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.messages.markAsRead(input);
		}),

	markAsUnread: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.messages.markAsUnread(input);
		}),

	addLabelToThread: protectedProcedure
		.input(
			z.object({
				threadId: z.string(),
				labelId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			console.log(input);
			await ctx.mailManager.messages.addLabelToThread(
				input.threadId,
				input.labelId
			);
		}),

	removeLabelFromThread: protectedProcedure
		.input(
			z.object({
				threadId: z.string(),
				labelId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.mailManager.messages.removeLabelFromThread(
				input.threadId,
				input.labelId
			);
		}),
});
