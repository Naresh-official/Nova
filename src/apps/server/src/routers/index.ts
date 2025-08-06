import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { router } from "../trpc";
import { threadsRouter } from "./threads.router";
import { userRouter } from "./user.router";
import { messagesRouter } from "./messages.router";

export const appRouter = router({
	threads: threadsRouter,
	user: userRouter,
	messages: messagesRouter,
});

export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
