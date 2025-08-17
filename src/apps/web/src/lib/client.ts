import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@server/routers";
import type { RouterInputs, RouterOutputs } from "@server/routers";

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> =
	createTRPCReact<AppRouter>();

export type { RouterInputs, RouterOutputs };
