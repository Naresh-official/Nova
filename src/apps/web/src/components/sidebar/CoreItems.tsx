"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, FileText, Send } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@nova/ui/components/sidebar";
import type { SchemaLabelType } from "@nova/server/schemas";

interface CoreItemsProps {
	labels: SchemaLabelType[] | undefined;
}

export function CoreItems({ labels }: CoreItemsProps) {
	const coreItems = [
		{
			title: "Inbox",
			url: "/mail/inbox",
			icon: Inbox,
			count:
				labels?.find((label) => label.name === "INBOX")?.threadsUnread || 0,
		},
		{
			title: "Drafts",
			url: "/mail/drafts",
			icon: FileText,
			count: labels?.find((label) => label.name === "DRAFT")?.threadsTotal || 0,
		},
		{
			title: "Sent",
			url: "/mail/sent",
			icon: Send,
			count: labels?.find((label) => label.name === "SENT")?.threadsTotal || 0,
		},
	];
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-[#999] text-xs font-medium mb-2">
				Core
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{coreItems.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={pathname === item.url}>
								<Link href={item.url} className="sidebar-item group">
									<item.icon className="w-4 h-4" />
									<span className="flex-1">{item.title}</span>
									{Number(item.count) > 0 && (
										<span className="ml-auto text-muted-foreground text-xs">
											{item.count}
										</span>
									)}
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
