import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import prisma from "@nova/db";
import bcrypt from "bcryptjs";

export function createContext({ req, res }: CreateExpressContextOptions) {
	return {
		req,
		res,
		prisma: prisma,
		hashPassword: (password: string) => bcrypt.hash(password, 12),
		verifyPassword: (password: string, hashedPassword: string) =>
			bcrypt.compare(password, hashedPassword),
	};
}
export type Context = ReturnType<typeof createContext>;
