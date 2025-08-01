"use client";

import { ArrowLeft, PanelLeft, RefreshCcw, Search } from "lucide-react";
import { Input } from "@nova/ui/components/input";
import CategoryMenu from "../list/CategoryMenu";
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
import { useEmailSearch } from "./hooks/useEmailSearch";

export function NovaHeader() {
	const [commandView, setCommandView] = useState<
		"default" | "search" | "filterOptions"
	>("default");
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		if (!dialogOpen) {
			setCommandView("default");
		}
	}, [dialogOpen]);

	const { handleRefresh } = useEmailSearch();

	return (
		<header className="border-b border-[#2A2A2A] p-3">
			<div className="flex items-center gap-1 max-w-md text-sm">
				<Button variant="ghost" size="sm">
					<PanelLeft className="text-muted-foreground cursor-pointer" />
				</Button>
				<Dialog
					open={dialogOpen}
					onOpenChange={(open) => {
						setDialogOpen(open);
					}}
				>
					<DialogTrigger asChild>
						<div className="relative flex-1 bg-black rounded-md overflow-hidden">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
							<Input
								placeholder="Search & Filter"
								readOnly
								className="pl-10 focus-visible:ring-0 focus-visible:outline-0"
							/>
						</div>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-1">
								{commandView !== "default" && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setCommandView("default")}
									>
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
