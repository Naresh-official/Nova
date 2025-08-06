"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
	Inbox,
	FileText,
	Send,
	Archive,
	AlertTriangle,
	Trash2,
	Tag,
	Plus,
	Settings,
	FileIcon as FileTemplate,
	Pencil,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarSeparator,
} from "@nova/ui/components/sidebar";
import { Button } from "@nova/ui/components/button";
import type { Dispatch, SetStateAction } from "react";

interface SidebarProps {
	setIsComposeOpenAction: Dispatch<SetStateAction<boolean>>;
}

const coreItems = [
	{ title: "Inbox", url: "/inbox", icon: Inbox, count: 156 },
	{ title: "Drafts", url: "/drafts", icon: FileText },
	{ title: "Sent", url: "/sent", icon: Send },
];

const managementItems = [
	{ title: "Archive", url: "/archive", icon: Archive },
	{ title: "Spam", url: "/spam", icon: AlertTriangle, count: 3 },
	{ title: "Bin", url: "/bin", icon: Trash2, count: 15 },
];

const bottomItems = [
	{ title: "Templates", url: "/templates", icon: FileTemplate },
	{ title: "Settings", url: "/settings", icon: Settings },
];

export function NovaSidebar({ setIsComposeOpenAction }: SidebarProps) {
	const pathname = usePathname();
	const { data: session } = useSession();

	const userName = session?.user?.name || "User";
	const userEmail = session?.user?.email || "";
	const userImage = session?.user?.image;
	const userInitial = userName.charAt(0).toUpperCase();

	return (
		<div className="pt-2 pl-2">
			<Sidebar className="border-0 h-[calc(100vh-18px)] m-2 rounded-xl overflow-x-hidden">
				<SidebarHeader className="p-4 bg-transparent">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
							{userImage ? (
								<Image
									src={userImage}
									alt={userName}
									width={40}
									height={40}
									className="w-full h-full object-cover"
								/>
							) : (
								userInitial
							)}
						</div>
						<div className="flex-1 min-w-0">
							<div className="font-semibold text-white truncate">
								{userName}
							</div>
							<div className="text-xs text-[#999] truncate">{userEmail}</div>
						</div>
					</div>
					<Button
						className="mt-4 w-full"
						onClick={() => setIsComposeOpenAction(true)}
					>
						<Pencil className="w-4 h-4 mr-2" />
						Compose
					</Button>
				</SidebarHeader>

				<SidebarContent>
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
												{item.count && (
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

					<SidebarSeparator className="my-2 max-w-56 mx-auto" />

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
												{item.count && (
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

					<SidebarSeparator className="my-2 max-w-56 mx-auto" />

					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								<Button
									variant="ghost"
									className="w-full hover:bg-[#2A2A2A] transition-colors"
								>
									<Tag className="w-4 h-4" />
									Labels
									<Plus className="w-6 h-6 text-muted-foreground ml-auto" />
								</Button>
								<div className="pl-8 py-1 text-sm text-muted-foreground">
									No labels yet
								</div>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarSeparator className="my-2 max-w-56 mx-auto" />

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
				</SidebarContent>
			</Sidebar>
		</div>
	);
}
