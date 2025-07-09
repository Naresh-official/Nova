import { router } from "../trpc";
import { userRouter } from "./user.router";

export const appRouter = router({
  user: userRouter,
});
