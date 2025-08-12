"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, AlertTriangle, Trash2 } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@nova/ui/components/sidebar";
import type { SchemaLabelType } from "@nova/server/schemas";

interface ManagementItemsProps {
	labels: SchemaLabelType[] | undefined;
}

export function ManagementItems({ labels }: ManagementItemsProps) {
	const pathname = usePathname();
	const managementItems = [
		{
			title: "Archive",
			url: "/mail/archive",
			icon: Archive,
		},
		{
			title: "Spam",
			url: "/mail/spam",
			icon: AlertTriangle,
			count: labels?.find((label) => label.name === "SPAM")?.threadsTotal || 0,
		},
		{
			title: "Trash",
			url: "/mail/trash",
			icon: Trash2,
			count: labels?.find((label) => label.name === "TRASH")?.threadsTotal || 0,
		},
	];

	return (
		<SidebarGroup>
			<SidebarGroupLabel className="text-[#999] text-xs font-medium mb-2">
				Management
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{managementItems.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={pathname === item.url}>
								<Link href={item.url} className="sidebar-item">
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
