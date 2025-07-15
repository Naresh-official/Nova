import type { User } from "../types";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const userRouter = router({
	login: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				name: z.string().min(1),
				image: z.string(),
				accessToken: z.string(),
				refreshToken: z.string(),
			})
		)
		.output(
			z.object({
				id: z.string(),
				email: z.string().email(),
				name: z.string(),
				image: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const user: User = await ctx.prisma.user.upsert({
				where: { email: input.email },
				update: {
					name: input.name,
					image: input.image,
					accessToken: input.accessToken,
					refreshToken: input.refreshToken,
					accessTokenExpiry: new Date(Date.now() + 3600 * 1000),
				},
				create: {
					email: input.email,
					name: input.name,
					image: input.image,
					accessToken: input.accessToken,
					refreshToken: input.refreshToken,
				},
			});
			return user;
		}),
});
