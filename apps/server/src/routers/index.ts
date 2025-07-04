import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const appRouter = router({
	getUser: publicProcedure.input(z.string()).query(() => {
		return { id: "1", name: "John Doe" };
	}),
});
