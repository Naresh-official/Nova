import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const userRouter = router({
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        image: z.string().optional(),
        accessToken: z.string(),
        refreshToken: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user: User = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          image: input.image,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
        },
      });
      const userWithOutTokens = {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
      return userWithOutTokens;
    }),

  getUserByEmail: publicProcedure
    .input(z.string().email())
    .query(async ({ ctx, input }) => {
      console.log("Fetching user by email:", input);
      const user: User | null = await ctx.prisma.user.findUnique({
        where: { email: input },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const userWithOutTokens = {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
      return userWithOutTokens;
    }),
});
