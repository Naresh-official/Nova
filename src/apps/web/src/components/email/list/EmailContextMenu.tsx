import React from "react";
import type { ThreadResponse } from "@nova/server/types";
import {
	ExternalLink,
	Reply,
	ReplyAll,
	Forward,
	Tag,
	Archive,
	Trash2,
	Mail,
	AlertTriangle,
	Heart,
	Clock,
	Zap,
	Star,
} from "lucide-react";
import { trpc } from "@/lib/client";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
	ContextMenuCheckboxItem,
} from "@nova/ui/components/context-menu";
import { toast } from "sonner";
import { useQueryStore } from "@/components/providers/QueryStoreProvider";
import { useEmailActions } from "@/hooks/useEmailActions";
import { usePathname } from "next/navigation";

interface EmailContextMenuProps {
	email: ThreadResponse;
	children: React.ReactNode;
}

export default function EmailContextMenu({
	email,
	children,
}: EmailContextMenuProps) {
	const utils = trpc.useUtils();
	const labels = utils.labels.getLabels.getData()?.customLabels;
	const pathname = usePathname();
	const folder = pathname.split("/").pop() || "";

	const labelIds = useQueryStore((state) => state.labelIds);
	const query = useQueryStore((state) => state.query);

	const { actions, isUnread, isStarred } = useEmailActions(email.id);

	const addLabelMutation = trpc.threads.addLabelToThread.useMutation({
		onMutate: async ({ threadId, labelId }) => {
			await utils.threads.listThreads.cancel();

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
								thread.id === threadId
									? {
											...thread,
											customLabels: [...(thread.customLabels || []), labelId],
										}
									: thread
							),
						})),
					};
				}
			);
		},
		onError: () => {
			utils.threads.listThreads.invalidate();
		},
		onSettled: () => {
			utils.threads.listThreads.invalidate();
		},
		onSuccess: () => {
			toast.success("Label added successfully");
		},
	});

	const removeLabelMutation = trpc.threads.removeLabelFromThread.useMutation({
		onMutate: async ({ threadId, labelId }) => {
			await utils.threads.listThreads.cancel();

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
								thread.id === threadId
									? {
											...thread,
											customLabels:
												thread.customLabels?.filter((id) => id !== labelId) ||
												[],
										}
									: thread
							),
						})),
					};
				}
			);
		},
		onError: () => {
			utils.threads.listThreads.invalidate();
		},
		onSettled: () => {
			utils.threads.listThreads.invalidate();
		},
		onSuccess: () => {
			toast.success("Label removed successfully");
		},
	});

	const handleLabelToggle = (labelId: string, isChecked: boolean) => {
		if (isChecked) {
			addLabelMutation.mutate({ threadId: email.id, labelId });
		} else {
			removeLabelMutation.mutate({ threadId: email.id, labelId });
		}
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

			<ContextMenuContent>
				<ContextMenuItem onClick={actions.handleOpenInNewTab}>
					<ExternalLink className="mr-2 h-4 w-4" />
					Open in new tab
				</ContextMenuItem>

				<ContextMenuItem>
					<Reply className="mr-2 h-4 w-4" />
					Reply
				</ContextMenuItem>

				<ContextMenuItem>
					<ReplyAll className="mr-2 h-4 w-4" />
					Reply All
				</ContextMenuItem>

				<ContextMenuItem>
					<Forward className="mr-2 h-4 w-4" />
					Forward
				</ContextMenuItem>

				<ContextMenuSub>
					<ContextMenuSubTrigger>
						<Tag className="mr-4 h-4 w-4 text-muted-foreground" />
						Labels
					</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						{labels?.map((label) => {
							const isChecked =
								email.customLabels?.includes(label?.id as string) || false;

							return (
								<ContextMenuCheckboxItem
									key={label.id}
									checked={isChecked}
									onCheckedChange={(checked) =>
										handleLabelToggle(label.id as string, checked === true)
									}
									borderColor={label.color?.backgroundColor || "#333"}
								>
									<div
										className="mr-2 h-3 w-3 rounded-full"
										style={{
											backgroundColor: label.color?.backgroundColor || "#333",
										}}
									/>
									{label.name}
								</ContextMenuCheckboxItem>
							);
						})}
					</ContextMenuSubContent>
				</ContextMenuSub>

				<ContextMenuSeparator />

				{folder === "trash" ? (
					<>
						<ContextMenuItem onClick={actions.handleRestoreFromTrash}>
							<Archive className="mr-2 h-4 w-4" />
							Restore from Trash
						</ContextMenuItem>
					</>
				) : (
					<>
						<ContextMenuItem onClick={actions.handleArchive}>
							<Archive className="mr-2 h-4 w-4" />
							Archive
						</ContextMenuItem>

						<ContextMenuItem onClick={actions.handleDelete}>
							<Trash2 className="mr-2 h-4 w-4" />
							Move to Trash
						</ContextMenuItem>

						<ContextMenuItem onClick={actions.handleMoveToSpam}>
							<Zap className="mr-2 h-4 w-4" />
							Move to Spam
						</ContextMenuItem>
					</>
				)}

				<ContextMenuSeparator />

				<ContextMenuItem
					onClick={
						isUnread ? actions.handleMarkAsRead : actions.handleMarkAsUnread
					}
				>
					<Mail className="mr-2 h-4 w-4" />
					{isUnread ? "Mark as Read" : "Mark as Unread"}
				</ContextMenuItem>

				<ContextMenuItem onClick={actions.handleMarkAsImportant}>
					<AlertTriangle className="mr-2 h-4 w-4" />
					Mark as Important
				</ContextMenuItem>

				<ContextMenuItem onClick={actions.handleToggleStar}>
					<Star className="mr-2 h-4 w-4" />
					{isStarred ? "Remove Star" : "Add Star"}
				</ContextMenuItem>

				<ContextMenuItem>
					<Clock className="mr-2 h-4 w-4" />
					Snooze
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
