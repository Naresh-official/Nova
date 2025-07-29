"use client";

import { PanelLeft, RefreshCcw, Search } from "lucide-react";
import { Input } from "@nova/ui/components/input";
import CategoryMenu from "./CategoryMenu";
import { Button } from "@nova/ui/components/button";
import { trpc } from "@/lib/client";

export function NovaHeader() {
	const utils = trpc.useUtils();

	const handleRefresh = () => {
		utils.threads.listThreads.setInfiniteData({}, () => ({
			pages: [],
			pageParams: [],
		}));
		utils.threads.listThreads.invalidate();
	};

	return (
		<header className="border-b border-[#2A2A2A] p-3">
			<div className="flex items-center gap-1 max-w-md text-sm">
				<Button variant="ghost" size="sm">
					<PanelLeft className="text-muted-foreground cursor-pointer" />
				</Button>
				<div className="relative flex-1 bg-black rounded-md overflow-hidden">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
					<Input
						placeholder="Search & Filter"
						className="pl-10 focus-visible:ring-0 focus-visible:outline-0"
					/>
				</div>
				<CategoryMenu />
				<Button variant="ghost" size="sm" onClick={handleRefresh}>
					<RefreshCcw className="text-muted-foreground cursor-pointer" />
				</Button>
			</div>
		</header>
	);
}
