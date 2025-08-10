"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, FileIcon as FileTemplate } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@nova/ui/components/sidebar";

const bottomItems = [
	{ title: "Templates", url: "/templates", icon: FileTemplate },
	{ title: "Settings", url: "/settings", icon: Settings },
];

export function BottomItems() {
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{bottomItems.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={pathname === item.url}>
								<Link href={item.url} className="sidebar-item">
									<item.icon className="w-4 h-4" />
									<span className="flex-1">{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
