"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarSeparator,
} from "@nova/ui/components/sidebar";
import { Button } from "@nova/ui/components/button";
import type { Dispatch, SetStateAction } from "react";
import { CoreItems } from "./CoreItems";
import { ManagementItems } from "./ManagementItems";
import { Labels } from "./Labels";
import { BottomItems } from "./BottomItems";
import { trpc } from "@/lib/client";

interface SidebarProps {
	setIsComposeOpenAction: Dispatch<SetStateAction<boolean>>;
}

export function NovaSidebar({ setIsComposeOpenAction }: SidebarProps) {
	const { data: session } = useSession();
	const { data: labels } = trpc.labels.getLabels.useQuery();

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
					<div className="scroll-container">
						<CoreItems labels={labels?.core} />

						<SidebarSeparator className="my-2 max-w-56 mx-auto" />

						<ManagementItems labels={labels?.management} />

						<SidebarSeparator className="my-2 max-w-56 mx-auto" />

						<Labels labels={labels?.customLabels} />
					</div>

					<SidebarSeparator className="my-2 max-w-56 mx-auto" />

					<BottomItems />
				</SidebarContent>
			</Sidebar>
		</div>
	);
}
