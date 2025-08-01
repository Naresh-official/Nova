import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@nova/server/routers";
import type { RouterInputs, RouterOutputs } from "@nova/server/routers";

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> =
	createTRPCReact<AppRouter>();

export type { RouterInputs, RouterOutputs };
