import { ThreadResponseSchema } from "src/schemas";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const threadsRouter = router({
	listThreads: protectedProcedure
		.output(z.array(ThreadResponseSchema))
		.query(async ({ ctx }) => {
			const threads = await ctx.mailManager.list();
			return threads;
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
			return thread;
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
});
