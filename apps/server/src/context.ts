import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export function createContext({
	req,
	res,
}: CreateExpressContextOptions): Context {
	return {
		req,
		res,
		prisma: prisma,
	};
}
export type Context = {
	req: CreateExpressContextOptions["req"];
	res: CreateExpressContextOptions["res"];
	prisma: PrismaClient;
};
