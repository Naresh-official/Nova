import { initTRPC, TRPCError } from "@trpc/server";
import { decode } from "next-auth/jwt";
import { GoogleMailManager } from "./lib/googleMailManager";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

const isLoggedIn = t.middleware(async ({ ctx, next }) => {
	const token = ctx.req.cookies["next-auth.session-token"];
	const decoded = await decode({
		token: token,
		secret: process.env.NEXTAUTH_SECRET as string,
	});
	if (!decoded) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const email = decoded.email as string;
	const user = await ctx.prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const mailManager = new GoogleMailManager({
		auth: {
			accessToken: user.accessToken,
			refreshToken: user.refreshToken,
		},
	});

	if (user.accessTokenExpiry < new Date()) {
		await ctx.prisma.user.update({
			where: { id: user.id },
			data: {
				accessToken: await mailManager.revokeToken(),
				accessTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
			},
		});
	}

	return next({
		ctx: {
			mailManager,
			userEmail: user.email as string,
		},
	});
});

export const protectedProcedure = t.procedure.use(isLoggedIn);
