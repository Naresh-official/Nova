// components/email/useEmailActions.ts
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/client";
import type { ThreadResponse } from "@nova/server/types";

export function useEmailActions() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentThreadId = searchParams.get("threadId");
	const utils = trpc.useUtils();

	// Extract email IDs from the infinite query cache
	const infiniteQueryData = utils.threads.listThreads.getInfiniteData({});
	const emails =
		infiniteQueryData?.pages.flatMap((page) =>
			page.emails.map((email) => email.id)
		) || [];

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
			await utils.threads.getThread.cancel(threadId);
			utils.threads.getThread.setData(threadId, (oldData) => {
				if (!oldData) return oldData;
				const isCurrentlyStarred =
					oldData.messages?.[0]?.labelIds?.includes("STARRED") || false;
				return {
					...oldData,
					messages: oldData.messages?.map((msg) => ({
						...msg,
						labelIds: isCurrentlyStarred
							? msg.labelIds?.filter((label) => label !== "STARRED")
							: [...(msg.labelIds || []), "STARRED"],
					})),
				};
			});

			utils.threads.listThreads.setInfiniteData({}, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						emails: page.emails.map((thread: ThreadResponse) => {
							if (thread.id !== threadId) return thread;
							const isCurrentlyStarred = thread.isStarred || false;
							return {
								...thread,
								isStarred: !isCurrentlyStarred,
							};
						}),
					})),
				};
			});
		},
	});

	const moveToArchive = trpc.threads.moveToArchive.useMutation({
		onSuccess: () => {
			utils.threads.listThreads.setInfiniteData({}, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						emails: page.emails.filter(
							(thread: ThreadResponse) => thread.id !== currentThreadId
						),
					})),
				};
			});

			utils.threads.listThreads.invalidate();
			utils.threads.listThreadIds.invalidate();
		},
	});
	const moveToSpam = trpc.threads.moveToSpam.useMutation({
		onSuccess: () => {
			utils.threads.listThreads.setInfiniteData({}, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => ({
						...page,
						emails: page.emails.filter(
							(thread: ThreadResponse) => thread.id !== currentThreadId
						),
					})),
				};
			});

			utils.threads.listThreads.invalidate();
			utils.threads.listThreadIds.invalidate();
		},
	});

	const markAsImportant = trpc.threads.markAsImportant.useMutation({
		onMutate: ({ threadId }) => {
			utils.threads.getThread.cancel(threadId);
			utils.threads.getThread.setData(threadId, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					messages: oldData.messages?.map((msg) => ({
						...msg,
						labelIds: [...(msg.labelIds || []), "IMPORTANT"],
					})),
				};
			});
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
			!currentThreadId || emails.indexOf(currentThreadId) === emails.length - 1,
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
				if (currentThreadId) toggleStar.mutate({ threadId: currentThreadId });
			},
			handleArchive: () => {
				if (currentThreadId)
					moveToArchive.mutate({ threadId: currentThreadId });
			},
			handleMoveToSpam: () => {
				if (currentThreadId) moveToSpam.mutate({ threadId: currentThreadId });
			},
			handleUnsubscribe: () => {
				if (currentThreadId)
					unsubscribeFromThread.mutate({ threadId: currentThreadId });
			},
			handleMarkAsImportant: () => {
				if (currentThreadId) {
					markAsImportant.mutate({ threadId: currentThreadId });
				}
			},
		},
	};
}
