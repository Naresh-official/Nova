import { router } from "../trpc";
import { threadsRouter } from "./threads.router";
import { userRouter } from "./user.router";

export const appRouter = router({
	threads: threadsRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;
