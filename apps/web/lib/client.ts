// lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@nova/server/trpc";

export const trpc = createTRPCReact<AppRouter>();
