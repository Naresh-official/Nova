import prisma from "@nova/db";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export function createContext({ req, res }: CreateExpressContextOptions) {
  return {
    req,
    res,
    prisma: prisma,
  };
}
export type Context = ReturnType<typeof createContext>;
