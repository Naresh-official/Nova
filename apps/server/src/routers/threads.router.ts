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
});
