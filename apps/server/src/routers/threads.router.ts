import { TRPCThreadResponseSchema } from "src/schemas";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";

export const threadsRouter = router({
	listThreads: protectedProcedure
		.output(z.array(TRPCThreadResponseSchema))
		.query(async ({ ctx }) => {
			const threads = await ctx.mailManager.list();
			return threads;
		}),
	getThread: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			console.log("Fetching thread with ID:", input);
			const thread = await ctx.mailManager.getThread(input);
			return thread;
		}),
});
