"use client";

import { ArrowLeft, RefreshCcw, Search } from "lucide-react";
import { Button } from "@nova/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@nova/ui/components/dialog";
import { useEffect, useState } from "react";
import DefaultDialogContent from "./DefaultDialogContent";
import SearchDialogContent from "./SearchDialogContent";
import { useQueryStore } from "../providers/QueryStoreProvider";
import { trpc } from "@/lib/client";
import { useRefreshStore } from "../providers/RefreshStoreProvider";
import { SidebarTrigger } from "@nova/ui/components/sidebar";
import CategoryMenu from "./CategoryMenu";

export function NovaHeader() {
	const utils = trpc.useUtils();
	const { query, setQuery, clearQuery, clearLabelIds } = useQueryStore(
		(state) => state
	);
	const { isRefreshing, setRefreshing } = useRefreshStore((state) => state);

	const [commandView, setCommandView] = useState<
		"default" | "search" | "filterOptions"
	>(!query ? "default" : "search");
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleRefresh = async () => {
		setRefreshing(true);
		utils.threads.listThreads.setInfiniteData({ q: query }, () => ({
			pages: [],
			pageParams: [],
		}));

		clearQuery();
		clearLabelIds();
		await utils.threads.listThreads.invalidate({ q: undefined });
		setRefreshing(false);
	};
	const handleBack = () => {
		setCommandView("default");
		setQuery("");
	};

	useEffect(() => {
		if (!dialogOpen && !query) {
			setCommandView("default");
		}
	}, [dialogOpen, query]);

	return (
		<header className="border-b border-[#2A2A2A] p-3">
			<div className="flex items-center gap-1 max-w-md text-sm">
				<SidebarTrigger />
				<Dialog
					open={dialogOpen}
					onOpenChange={(open) => {
						setDialogOpen(open);
					}}
				>
					<DialogTrigger
						asChild
						className="focus-visible:ring-0 focus-visible:outline-0 focus-visible:border-input"
						disabled={isRefreshing}
					>
						<Button
							variant="outline"
							className="flex-1 flex items-center justify-start bg-black rounded-md text-muted-foreground cursor-pointer"
						>
							<Search className="w-4 h-4" />
							<div className="text-sm bg-transparent w-full rounded-md">
								<p className="w-36 truncate text-start">
									{query || "Search & Filter"}
								</p>
							</div>
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-1">
								{commandView !== "default" && (
									<Button variant="ghost" size="sm" onClick={handleBack}>
										<ArrowLeft className="cursor-pointer" />
									</Button>
								)}
								<span>Search & Filter</span>
							</DialogTitle>
						</DialogHeader>
						{commandView === "default" && (
							<DefaultDialogContent setCommandView={setCommandView} />
						)}
						{commandView === "search" && (
							<SearchDialogContent setDialogOpen={setDialogOpen} />
						)}
						{/* {commandView === "filterOptions" && <FilterOptionsDialogContent />} */}
					</DialogContent>
				</Dialog>
				<CategoryMenu />
				<Button variant="ghost" size="sm" onClick={handleRefresh}>
					<RefreshCcw className="text-muted-foreground cursor-pointer" />
				</Button>
			</div>
		</header>
	);
}
