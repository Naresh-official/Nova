import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/client";
import type { ThreadResponse } from "@nova/server/types";
import { useQueryStore } from "@/components/providers/QueryStoreProvider";

export function useEmailActions() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentThreadId = searchParams.get("threadId") ?? "";
	const utils = trpc.useUtils();
	const query = useQueryStore((s) => s.query);
	const labelIds = useQueryStore((s) => s.labelIds);

	// Pull current emails list from cache
	const infiniteQueryData = utils.threads.listThreads.getInfiniteData({
		q: query || undefined,
		labelIds,
	});
	const emails: string[] =
		infiniteQueryData?.pages.flatMap((page) =>
			page.emails.map((email) => email.id)
		) || [];
	// Determine the state of current thread
	const threadData = utils.threads.getThread.getData(currentThreadId);
	const isStarred =
		threadData?.thread.messages?.[0]?.labelIds?.includes("STARRED") ?? false;

	const disablePrev = !currentThreadId || emails.indexOf(currentThreadId) <= 0;
	const disableNext =
		!currentThreadId || emails.indexOf(currentThreadId) === emails.length - 1;

	// Mutations
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
					oldData.thread.messages?.[0]?.labelIds?.includes("STARRED") ?? false;

				return {
					...oldData,
					thread: {
						...oldData.thread,
						messages: oldData.thread.messages?.map((msg) => ({
							...msg,
							labelIds: isCurrentlyStarred
								? msg.labelIds?.filter((l) => l !== "STARRED")
								: [...(msg.labelIds || []), "STARRED"],
						})),
					},
				};
			});

			utils.threads.listThreads.setInfiniteData(
				{
					q: query || undefined,
					labelIds: labelIds,
				},
				(oldData) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							emails: page.emails.map((thread) =>
								thread.id === currentThreadId
									? { ...thread, isUnread: false }
									: thread
							),
						})),
					};
				}
			);
		},
	});

	const moveToArchive = trpc.threads.moveToArchive.useMutation({
		onSuccess: () => {
			utils.threads.listThreads.setInfiniteData(
				{ q: query || undefined, labelIds },
				(oldData) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							emails: page.emails.filter(
								(thread) => thread.id !== currentThreadId
							),
						})),
					};
				}
			);
			utils.threads.listThreads.invalidate();
			utils.threads.listThreadIds.invalidate();
		},
	});

	const moveToSpam = trpc.threads.moveToSpam.useMutation({
		onSuccess: () => {
			utils.threads.listThreads.setInfiniteData(
				{ q: query || undefined, labelIds },
				(oldData) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,
							emails: page.emails.filter(
								(thread) => thread.id !== currentThreadId
							),
						})),
					};
				}
			);
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
					messages: oldData.thread.messages?.map((msg) => ({
						...msg,
						labelIds: [...(msg.labelIds || []), "IMPORTANT"],
					})),
				};
			});
		},
	});

	// Actions
	const actions = {
		handleClose: () => router.push(pathname),
		handlePrevious: () => {
			const index = emails.indexOf(currentThreadId);
			if (index > 0) {
				router.push(`${pathname}?threadId=${emails[index - 1]}`);
			}
		},
		handleNext: () => {
			const index = emails.indexOf(currentThreadId);
			if (index < emails.length - 1) {
				router.push(`${pathname}?threadId=${emails[index + 1]}`);
			}
		},
		handleDelete: () => {
			if (currentThreadId) {
				// Cancel any outgoing fetches for this thread
				utils.threads.getThread.cancel(currentThreadId);

				// Optimistically remove the thread from the list
				utils.threads.listThreads.setInfiniteData(
					{ q: query || undefined, labelIds },
					(oldData) => {
						if (!oldData) return oldData;
						return {
							...oldData,
							pages: oldData.pages.map((page) => ({
								...page,
								emails: page.emails.filter(
									(thread) => thread.id !== currentThreadId
								),
							})),
						};
					}
				);

				// Optionally mark the thread as trashed in getThread (if needed)
				utils.threads.getThread.setData(currentThreadId, undefined);

				// Now perform the mutation
				trashThread.mutate({ threadId: currentThreadId });

				router.push(pathname);
			}
		},
		handleToggleStar: () => {
			if (currentThreadId) {
				// Optimistic update: toggle star in cache immediately
				utils.threads.listThreads.setInfiniteData(
					{ q: query || undefined, labelIds },
					(oldData) => {
						if (!oldData) return oldData;
						return {
							...oldData,
							pages: oldData.pages.map((page) => ({
								...page,
								emails: page.emails.map((email) =>
									email.id === currentThreadId
										? { ...email, isStarred: !email.isStarred }
										: email
								),
							})),
						};
					}
				);
				toggleStar.mutate({ threadId: currentThreadId });
			}
		},
		handleArchive: () => {
			if (currentThreadId) moveToArchive.mutate({ threadId: currentThreadId });
		},
		handleMoveToSpam: () => {
			if (currentThreadId) moveToSpam.mutate({ threadId: currentThreadId });
		},
		handleUnsubscribe: () => {
			if (currentThreadId)
				unsubscribeFromThread.mutate({ threadId: currentThreadId });
		},
		handleMarkAsImportant: () => {
			if (currentThreadId)
				markAsImportant.mutate({ threadId: currentThreadId });
		},
	};

	return {
		currentThreadId,
		isStarred,
		disablePrev,
		disableNext,
		actions,
	};
}
