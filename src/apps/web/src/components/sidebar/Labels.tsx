"use client";

import { Bookmark } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@nova/ui/components/sidebar";
import type { SchemaLabelType } from "@nova/server/schemas";
import Link from "next/link";
import { usePathname } from "next/navigation";

import CreateLabelDialog from "./CreateLabelDialog";

interface LabelsProps {
	labels: SchemaLabelType[] | undefined;
}

export function Labels({ labels }: LabelsProps) {
	const pathname = usePathname();

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
						labels.map((item) => (
							<SidebarMenuItem key={item.id}>
								<SidebarMenuButton
									asChild
									isActive={pathname === `/${item.id?.toLowerCase()}`}
								>
									<Link
										href={`/${item.id?.toLowerCase()}`}
										className="sidebar-item group"
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
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))
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
