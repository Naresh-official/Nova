"use client";

import { Bookmark, Trash2 } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@nova/ui/components/sidebar";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@nova/ui/components/context-menu";
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
import type { SchemaLabelType } from "@nova/server/schemas";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/client";

import CreateLabelDialog from "./CreateLabelDialog";

interface LabelsProps {
	labels: SchemaLabelType[] | undefined;
}

export function Labels({ labels }: LabelsProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const deleteLabel = trpc.labels.deleteLabel.useMutation();
	const utils = trpc.useUtils();

	const handleLabelClick = (labelId: string) => {
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		const existingLabels = searchParams.get("labels");
		let labelIds = existingLabels ? existingLabels.split(",") : [];

		if (labelIds.includes(labelId)) {
			labelIds = labelIds.filter((id) => id !== labelId);
		} else {
			labelIds.push(labelId);
		}

		current.delete("labels");

		let query = current.toString();

		if (labelIds.length > 0) {
			query += (query ? "&" : "") + `labels=${labelIds.join(",")}`;
		}

		router.push(`${pathname}${query ? `?${query}` : ""}`);
	};

	const confirmDeleteLabel = (labelId: string, labelName: string) => {
		deleteLabel.mutate(labelId, {
			onSuccess: () => {
				toast.success(`Label "${labelName}" deleted`);
				utils.labels.getLabels.invalidate();
			},
			onError: (error) => {
				toast.error(`Failed to delete label: ${error.message}`);
			},
		});
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-[#999] text-xs font-medium mb-2">
				<div className="flex items-center justify-between w-full">
					Labels
					<CreateLabelDialog />
				</div>
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{labels && labels.length > 0 ? (
						labels.map((item) => {
							const existingLabels = searchParams.get("labels");
							const selectedLabels = existingLabels
								? existingLabels.split(",")
								: [];
							const isActive = selectedLabels.includes(item.id!);

							return (
								<SidebarMenuItem key={item.id}>
									<ContextMenu>
										<ContextMenuTrigger asChild>
											<SidebarMenuButton asChild isActive={isActive}>
												<div
													onClick={() => handleLabelClick(item.id!)}
													className="sidebar-item group cursor-pointer"
												>
													<Bookmark
														className={`w-4 h-4`}
														fill={item?.color?.backgroundColor || ""}
														style={{
															color: item?.color?.backgroundColor || "",
														}}
													/>
													<span className="flex-1">{item.name}</span>
													{Number(item.threadsTotal) > 0 && (
														<span className="ml-auto text-muted-foreground text-xs">
															{item.threadsTotal}
														</span>
													)}
												</div>
											</SidebarMenuButton>
										</ContextMenuTrigger>
										<ContextMenuContent>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<ContextMenuItem
														onSelect={(e) => e.preventDefault()}
														className="text-red-600 focus:text-red-600"
													>
														<Trash2 className="w-4 h-4 mr-2 text-red-600" />
														Delete
													</ContextMenuItem>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Delete Label</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to delete the label "
															{item.name}"? This action cannot be undone and
															will remove the label from all emails.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() =>
																confirmDeleteLabel(item.id!, item.name!)
															}
															disabled={deleteLabel.isPending}
															className="bg-red-600 hover:bg-red-700"
														>
															{deleteLabel.isPending ? "Deleting..." : "Delete"}
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</ContextMenuContent>
									</ContextMenu>
								</SidebarMenuItem>
							);
						})
					) : (
						<div className="pl-8 py-1 text-sm text-muted-foreground">
							No labels yet
						</div>
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
