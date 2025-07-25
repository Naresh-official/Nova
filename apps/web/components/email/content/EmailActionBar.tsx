import React from "react";
import {
	X,
	ChevronLeft,
	ChevronRight,
	ReplyAll,
	Archive,
	Star,
	Trash2,
	MoreVertical,
	Printer,
	AlertTriangle,
	UserX,
	Zap,
} from "lucide-react";
import { Button } from "@nova/ui/components/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@nova/ui/components/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nova/ui/components/dropdown-menu";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/client";
import type { ThreadResponse } from "@nova/server/types";

interface EmailActionBarProps {
	onPrint?: () => void;
}

function EmailActionBar({ onPrint }: EmailActionBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentThreadId = searchParams.get("threadId");
	const utils = trpc.useUtils();

	const { data: emails } = trpc.threads.listThreadIds.useQuery();

	const trashThread = trpc.threads.trashThread.useMutation({
		onSuccess: () => {
			utils.threads.listThreads.invalidate();
			utils.threads.listThreadIds.invalidate();
		},
	});

	const toggleStar = trpc.threads.toggleStar.useMutation({
		onMutate: async ({ threadId }) => {
			await utils.threads.getThread.cancel(threadId);
			utils.threads.getThread.setData(threadId, (oldData) => {
				if (!oldData) return oldData;
				const isCurrentlyStarred =
					oldData.messages?.[0]?.labelIds?.includes("STARRED") ||
					false;
				return {
					...oldData,
					messages: oldData.messages?.map((msg) => ({
						...msg,
						labelIds: isCurrentlyStarred
							? msg.labelIds?.filter(
									(label) => label !== "STARRED"
								)
							: [...(msg.labelIds || []), "STARRED"],
					})),
				};
			});

			utils.threads.listThreads.setData(undefined, (oldThreads) => {
				if (!oldThreads) return oldThreads;
				return oldThreads.map((thread: ThreadResponse) => {
					if (thread.id !== threadId) return thread;
					const isCurrentlyStarred = thread.isStarred || false;
					false;
					return {
						...thread,
						isStarred: !isCurrentlyStarred,
					};
				});
			});
		},
	});

	const moveToArchive = trpc.threads.moveToArchive.useMutation({
		onSuccess: () => {
			utils.threads.listThreads.setData(undefined, (oldThreads) => {
				if (!oldThreads) return oldThreads;
				return oldThreads.filter(
					(thread: ThreadResponse) => thread.id !== currentThreadId
				);
			});

			utils.threads.listThreads.invalidate();
			utils.threads.listThreadIds.invalidate();
		},
	});

	const moveToSpam = trpc.threads.moveToSpam.useMutation({
		onSuccess: () => {
			utils.threads.listThreads.setData(undefined, (oldThreads) => {
				if (!oldThreads) return oldThreads;
				return oldThreads.filter(
					(thread: ThreadResponse) => thread.id !== currentThreadId
				);
			});

			utils.threads.listThreads.invalidate();
			utils.threads.listThreadIds.invalidate();
		},
	});

	const unsubscribeFromThread =
		trpc.threads.unsubscribeFromThread.useMutation();

	const isStarred =
		utils.threads.getThread
			.getData(currentThreadId as string)
			?.messages?.[0]?.labelIds?.includes("STARRED") || false;

	const handleClose = () => {
		router.push(pathname);
	};

	const handlePrevious = () => {
		if (!emails || !currentThreadId) return;

		const currentIndex = emails.findIndex(
			(email) => email === currentThreadId
		);
		if (currentIndex > 0) {
			const previousThreadId = emails[currentIndex - 1];
			router.push(`${pathname}?threadId=${previousThreadId}`);
		}
	};

	const handleNext = () => {
		if (!emails || !currentThreadId) return;

		const currentIndex = emails.findIndex(
			(email) => email === currentThreadId
		);
		if (currentIndex < emails.length - 1) {
			const nextThreadId = emails[currentIndex + 1];
			router.push(`${pathname}?threadId=${nextThreadId}`);
		}
	};

	const handleDelete = async () => {
		if (currentThreadId) {
			trashThread.mutate({ threadId: currentThreadId as string });
			router.push(pathname);
		}
	};

	const handleToggleStar = () => {
		if (currentThreadId) {
			toggleStar.mutate({ threadId: currentThreadId });
		}
	};

	const handleArchive = () => {
		if (currentThreadId) {
			moveToArchive.mutate({ threadId: currentThreadId });
			router.push(pathname);
		}
	};

	const handleMoveToSpam = () => {
		if (currentThreadId) {
			moveToSpam.mutate({ threadId: currentThreadId });
			router.push(pathname);
		}
	};

	const handleUnsubscribe = () => {
		if (currentThreadId) {
			unsubscribeFromThread.mutate({ threadId: currentThreadId });
		}
	};

	return (
		<div className="flex items-center justify-between p-2 rounded-lg font-sans">
			{/* Left side controls */}
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					className="p-2 text-zinc-300"
					onClick={handleClose}
				>
					<X size={20} />
				</Button>
				<div className="w-px h-6 bg-zinc-600 mx-1"></div>
				<Button
					variant="ghost"
					className="p-2 text-zinc-300"
					onClick={handlePrevious}
					disabled={
						!emails ||
						!currentThreadId ||
						emails.findIndex(
							(email) => email === currentThreadId
						) === 0
					}
				>
					<ChevronLeft size={22} />
				</Button>
				<Button
					variant="ghost"
					className="p-2 text-zinc-300"
					onClick={handleNext}
					disabled={
						!emails ||
						!currentThreadId ||
						emails.findIndex(
							(email) => email === currentThreadId
						) ===
							emails.length - 1
					}
				>
					<ChevronRight size={22} />
				</Button>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="secondary"
					className="flex items-center gap-2 px-4 py-2 text-zinc-200"
				>
					<ReplyAll size={20} />
					<span className="text-sm font-medium">Reply all</span>
				</Button>
				<Button
					variant="secondary"
					onClick={handleArchive}
					className="p-2 text-zinc-300"
				>
					<Archive size={18} />
				</Button>
				<Button
					variant="secondary"
					onClick={handleToggleStar}
					className="p-2 text-zinc-300"
				>
					<Star size={20} fill={isStarred ? "yellow" : "none"} />
				</Button>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="secondary"
							className="p-2 text-red-400 hover:bg-red-400/20"
						>
							<Trash2 size={20} />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Move Email Thread to Trash?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This email thread will be moved to trash. You
								can restore it later from the trash folder.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={handleDelete}>
								Move to Trash
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="secondary"
							className="p-2 text-zinc-300"
						>
							<MoreVertical size={20} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={onPrint}
						>
							<Printer size={16} />
							<span>Print</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={handleMoveToSpam}
						>
							<AlertTriangle size={16} />
							<span>Move to Spam</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="flex items-center gap-2"
							onClick={handleUnsubscribe}
						>
							<UserX size={16} />
							<span>Unsubscribe</span>
						</DropdownMenuItem>
						<DropdownMenuItem className="flex items-center gap-2">
							<Zap size={16} />
							<span>Mark as Important</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

export default EmailActionBar;
