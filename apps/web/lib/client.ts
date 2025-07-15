import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@nova/server/trpc";

export const client = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url:
				process.env.NEXT_PUBLIC_BACKEND_URL ||
				"http://localhost:8000/trpc",
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});
