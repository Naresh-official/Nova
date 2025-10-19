"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { SquarePen } from "lucide-react";
import { Suspense } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarSeparator,
} from "@nova/ui/components/sidebar";
import { Button } from "@nova/ui/components/button";
import { Skeleton } from "@nova/ui/components/skeleton";
import { CoreItems } from "./CoreItems";
import { ManagementItems } from "./ManagementItems";
import { Labels } from "./Labels";
import { BottomItems } from "./BottomItems";
import { trpc } from "@/lib/client";
import { useRouter, useSearchParams } from "next/navigation";

function NovaSidebarContent() {
	const { data: session, status } = useSession();
	const { data: labels } = trpc.labels.getLabels.useQuery();
	const router = useRouter();
	const searchParams = useSearchParams();

	const userName = session?.user?.name || "User";
	const userEmail = session?.user?.email || "";
	const userImage = session?.user?.image;
	const userInitial = userName.charAt(0).toUpperCase();

	const isLoading = status === "loading";

	const handleComposeClick = () => {
		const params = new URLSearchParams(searchParams?.toString() || "");
		params.set("isComposeOpen", "true");
		router.push(`?${params.toString()}`);
	};

	return (
		<div>
			<Sidebar className="border-0 h-[calc(100vh-18px)] m-2 rounded-xl overflow-x-hidden">
				<SidebarHeader className="p-4 bg-transparent">
					<div className="flex items-center gap-3">
						{isLoading ? (
							<Skeleton className="w-10 h-10 rounded-full" />
						) : (
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
								{userImage ? (
									<Image
										src={userImage}
										alt={userName}
										width={20}
										height={20}
										className="w-full h-full object-cover"
									/>
								) : (
									userInitial
								)}
							</div>
						)}
						<div className="flex-1 min-w-0">
							{isLoading ? (
								<>
									<Skeleton className="h-4 w-24 mb-1" />
									<Skeleton className="h-3 w-32" />
								</>
							) : (
								<>
									<div className="font-semibold text-white truncate">
										{userName}
									</div>
									<div
										title={userEmail}
										className="text-xs text-[#999] truncate"
									>
										{userEmail}
									</div>
								</>
							)}
						</div>
					</div>
					<Button
						className="mt-4 w-full"
						onClick={handleComposeClick}
						disabled={isLoading}
					>
						<SquarePen className="w-4 h-4" />
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

export function NovaSidebar() {
	return (
		<Suspense
			fallback={
				<div className="border-0 h-[calc(100vh-18px)] m-2 rounded-xl overflow-x-hidden w-64 bg-[#1a1a1a] flex items-center justify-center">
					<div className="text-white">Loading sidebar...</div>
				</div>
			}
		>
			<NovaSidebarContent />
		</Suspense>
	);
}
