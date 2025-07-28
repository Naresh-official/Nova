import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../server/src/routers";
import type { RouterInputs, RouterOutputs } from "../../server/src/routers";

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

export type { RouterInputs, RouterOutputs };
