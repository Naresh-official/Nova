// components/email/useEmailActions.ts
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/client";

export function useEmailActions() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentThreadId = searchParams.get("threadId");
	const utils = trpc.useUtils();

	const emails = trpc.threads.listThreadIds.useQuery().data || [];

	const trashThread = trpc.threads.trashThread.useMutation({
		onSuccess: () => {
			utils.threads.listThreads.invalidate();
			utils.threads.listThreadIds.invalidate();
		},
	});

	const unsubscribeFromThread =
		trpc.threads.unsubscribeFromThread.useMutation();

	const toggleStar = trpc.threads.toggleStar.useMutation({
		onMutate: async ({ threadId }) => {
			// Optimistic update logic
		},
	});

	const moveToArchive = trpc.threads.moveToArchive.useMutation({
		onSuccess: () => {
			/* ... */
		},
	});
	const moveToSpam = trpc.threads.moveToSpam.useMutation({
		onSuccess: () => {
			/* ... */
		},
	});

	return {
		currentThreadId,
		isStarred:
			utils.threads.getThread
				.getData(currentThreadId as string)
				?.messages?.[0]?.labelIds?.includes("STARRED") || false,
		disablePrev: !currentThreadId || emails.indexOf(currentThreadId) === 0,
		disableNext:
			!currentThreadId ||
			emails.indexOf(currentThreadId) === emails.length - 1,
		actions: {
			handleClose: () => router.push(pathname),
			handlePrevious: () => {
				const index = emails.indexOf(currentThreadId as string);
				if (index > 0) {
					router.push(`${pathname}?threadId=${emails[index - 1]}`);
				}
			},
			handleNext: () => {
				const index = emails.indexOf(currentThreadId as string);
				if (index < emails.length - 1) {
					router.push(`${pathname}?threadId=${emails[index + 1]}`);
				}
			},
			handleDelete: () => {
				if (currentThreadId) {
					trashThread.mutate({ threadId: currentThreadId });
					router.push(pathname);
				}
			},
			handleToggleStar: () => {
				if (currentThreadId)
					toggleStar.mutate({ threadId: currentThreadId });
			},
			handleArchive: () => {
				if (currentThreadId)
					moveToArchive.mutate({ threadId: currentThreadId });
			},
			handleMoveToSpam: () => {
				if (currentThreadId)
					moveToSpam.mutate({ threadId: currentThreadId });
			},
			handleUnsubscribe: () => {
				if (currentThreadId)
					unsubscribeFromThread.mutate({ threadId: currentThreadId });
			},
		},
	};
}
